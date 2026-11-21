import { useState } from 'react';
import { useApp } from '../store/AppStore.jsx';
import { getRestaurant } from '../data/restaurants.js';
import { ORDER_STEPS } from '../data/orders.js';
import { paymentMethods } from '../data/user.js';
import { navigate } from '../lib/router.js';
import { money, formatTime, formatDate } from '../lib/format.js';
import { orderProgress, minutesLeft } from '../lib/orders.js';
import { useNow } from '../lib/useNow.js';
import { Screen, TopBar, EmptyState, RestaurantAvatar } from '../components/ui.jsx';
import MapPlaceholder from '../components/MapPlaceholder.jsx';
import Icon, { Star } from '../components/Icon.jsx';
import './Tracking.css';

const ON_WAY = ORDER_STEPS.findIndex((s) => s.id === 'onway');
const PICKED = ORDER_STEPS.findIndex((s) => s.id === 'picked');
const LAST = ORDER_STEPS.length - 1;

/** 0 → at restaurant, 1 → at your door. */
function courierT(order, step, now) {
  if (step >= LAST) return 1;
  if (step < PICKED) return 0;
  if (step < ON_WAY) return 0.06;
  const a = ORDER_STEPS[ON_WAY].at;
  const b = ORDER_STEPS[LAST].at;
  const el = (now - order.simStart) / 1000;
  return Math.min(0.97, 0.06 + ((el - a) / (b - a)) * 0.91);
}

function RateOrder() {
  const [stars, setStars] = useState(0);
  const { showToast } = useApp();
  return (
    <div className="rate">
      <p id="rate-h">How was your order?</p>
      <div className="rate-stars" role="radiogroup" aria-labelledby="rate-h">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={stars === n}
            aria-label={`${n} star${n > 1 ? 's' : ''}`}
            className={n <= stars ? 'is-on' : ''}
            onClick={() => {
              setStars(n);
              showToast('Thanks for your feedback!', { tone: 'success' });
            }}
          >
            <Star size={28} />
          </button>
        ))}
      </div>
    </div>
  );
}

export default function Tracking({ id }) {
  const { getOrder, advanceOrder, showToast, reorder } = useApp();
  const order = getOrder(id);
  const live = order?.status === 'active';
  const now = useNow(1000, live);

  if (!order) {
    return (
      <Screen header={<TopBar title="Track order" fallback="/orders" />} label="Track order">
        <EmptyState icon="orders" title="Order not found" text="We couldn’t find that order." action="View orders" to="/orders" />
      </Screen>
    );
  }

  const r = getRestaurant(order.restaurantId);
  const { step, cancelled } = orderProgress(order, now);
  const delivered = step === LAST;
  const s = cancelled ? null : ORDER_STEPS[step];
  const mins = minutesLeft(order, now);
  const arriveAt = order.schedule || (order.simStart ? order.placedAt + order.etaMinutes * 60000 : order.placedAt);
  const courier = order.courier || { name: 'Daniel R.', vehicle: 'E-bike', rating: 4.9, initials: 'DR', deliveries: 1240 };
  const pay = paymentMethods.find((p) => p.id === order.payment);
  const demoCall = (who) => showToast(`Calling ${who}… (demo — no call is made)`);

  return (
    <Screen header={<TopBar title={`Order ${order.id}`} subtitle={r.name} fallback="/orders" />} className="tracking" label="Order tracking">
      {!cancelled && (
        <MapPlaceholder
          t={courierT(order, step, now)}
          label={
            delivered
              ? 'Map: order delivered to your address'
              : `Map: courier ${step < PICKED ? 'waiting at the restaurant' : 'travelling from the restaurant to your address'}`
          }
        />
      )}

      <div className={`trk-sheet ${cancelled ? 'is-flat' : ''}`}>
        {/* Status header */}
        <section className="trk-status">
          <p className="sr-only" aria-live="polite">
            {cancelled ? 'Order cancelled' : s.label}
          </p>
          {cancelled ? (
            <>
              <p className="trk-kicker">{formatDate(order.placedAt)}</p>
              <h1>Order cancelled</h1>
              <p className="muted">This order was cancelled and fully refunded.</p>
            </>
          ) : delivered ? (
            <>
              <p className="trk-kicker is-green">
                <Icon name="check" size={14} strokeWidth={3} /> Delivered
              </p>
              <h1>Enjoy your meal!</h1>
              <p className="muted">Delivered {order.deliveredAt ? `at ${formatTime(order.deliveredAt)}` : `on ${formatDate(order.placedAt)}`}</p>
            </>
          ) : (
            <>
              <p className="trk-kicker">
                <span className="live-dot" aria-hidden="true" /> {s.label}
              </p>
              {order.schedule ? (
                <h1>
                  Scheduled for <span className="trk-mins">{formatTime(order.schedule)}</span>
                </h1>
              ) : (
                <h1>
                  Arriving in <span className="trk-mins">{mins} min</span>
                </h1>
              )}
              <p className="muted">
                {order.schedule ? 'Scheduled delivery' : `Estimated arrival ${formatTime(arriveAt)}`} · {s.detail}
              </p>
            </>
          )}
          {!cancelled && (
            <div className="trk-bars" aria-hidden="true">
              {ORDER_STEPS.map((x, i) => (
                <span key={x.id} className={i < step ? 'is-done' : i === step ? (delivered ? 'is-done' : 'is-now') : ''} />
              ))}
            </div>
          )}
        </section>

        {delivered && (
          <section className="card trk-card">
            <RateOrder />
            <button type="button" className="btn btn-dark btn-block gap-top" onClick={() => reorder(order)}>
              <Icon name="refresh" size={18} /> Reorder
            </button>
          </section>
        )}

        {/* Courier */}
        {!cancelled && !delivered && (
          <section className="card trk-card trk-person" aria-label="Your courier">
            <span className="trk-avatar" aria-hidden="true">
              {courier.initials}
            </span>
            <div className="trk-person-text">
              <b>{courier.name}</b>
              <span>
                <Star size={12} /> {courier.rating.toFixed(1)} · {courier.vehicle} · {step < PICKED ? 'Heading to restaurant' : 'Has your order'}
              </span>
            </div>
            <button
              type="button"
              className="icon-btn"
              onClick={() => showToast(`Message sent to ${courier.name} (demo)`)}
              aria-label={`Message ${courier.name}`}
            >
              <Icon name="message" size={18} />
            </button>
            <button type="button" className="icon-btn trk-call" onClick={() => demoCall(courier.name)} aria-label={`Call ${courier.name}`}>
              <Icon name="phone" size={18} />
            </button>
          </section>
        )}

        {/* Restaurant */}
        <section className="card trk-card trk-person" aria-label="Restaurant">
          <RestaurantAvatar restaurant={r} size={44} />
          <div className="trk-person-text">
            <b>{r.name}</b>
            <span>{r.cuisines.join(' · ')}</span>
          </div>
          <button type="button" className="icon-btn" onClick={() => demoCall(r.name)} aria-label={`Call ${r.name}`}>
            <Icon name="phone" size={18} />
          </button>
          <button type="button" className="icon-btn" onClick={() => navigate(`/restaurant/${r.id}`)} aria-label={`Open ${r.name} menu`}>
            <Icon name="store" size={18} />
          </button>
        </section>

        {/* Timeline */}
        {!cancelled && (
          <section className="trk-timeline" aria-labelledby="tl-h">
            <h2 id="tl-h">Order status</h2>
            <ol>
              {ORDER_STEPS.map((x, i) => {
                const state = i < step || delivered ? 'done' : i === step ? 'now' : 'todo';
                return (
                  <li key={x.id} className={`tl-${state}`} aria-current={state === 'now' ? 'step' : undefined}>
                    <span className="tl-dot" aria-hidden="true">
                      {state === 'done' && <Icon name="check" size={12} strokeWidth={3.5} />}
                    </span>
                    <span className="tl-text">
                      <b>{x.label}</b>
                      <span>{state === 'todo' ? x.detail : order.stepTimes?.[i] ? formatTime(order.stepTimes[i]) : x.detail}</span>
                    </span>
                    <span className="sr-only">{state === 'done' ? '(completed)' : state === 'now' ? '(in progress)' : '(upcoming)'}</span>
                  </li>
                );
              })}
            </ol>
          </section>
        )}

        {/* Details */}
        <section className="card trk-card" aria-labelledby="det-h">
          <h2 id="det-h" className="trk-h2">
            Order details
          </h2>
          <ul className="trk-items" role="list">
            {order.items.map((i, n) => (
              <li key={n}>
                <span className="trk-qty">{i.qty}×</span>
                <span className="trk-item-text">
                  <b>{i.name}</b>
                  {i.optionsText && <span>{i.optionsText}</span>}
                </span>
                <span>{money(i.unit * i.qty)}</span>
              </li>
            ))}
          </ul>
          <dl className="trk-meta">
            {order.address && (
              <div>
                <dt>Address</dt>
                <dd>
                  {order.address.label} · {order.address.line1}
                </dd>
              </div>
            )}
            <div>
              <dt>Payment</dt>
              <dd>{pay?.label} (demo)</dd>
            </div>
            {order.discount > 0 && (
              <div>
                <dt>Discount</dt>
                <dd className="is-free-text">−{money(order.discount)}</dd>
              </div>
            )}
            <div className="trk-total">
              <dt>Total</dt>
              <dd>{money(order.total)}</dd>
            </div>
          </dl>
        </section>

        {live && !delivered && (
          <div className="trk-demo">
            <p>Tracking runs on an accelerated demo timeline.</p>
            <button type="button" className="btn btn-xs btn-ghost" onClick={() => advanceOrder(order.id)}>
              Skip to next status
            </button>
          </div>
        )}
        <div className="bottom-space" />
      </div>
    </Screen>
  );
}
