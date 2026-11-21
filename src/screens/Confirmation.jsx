import { useApp } from '../store/AppStore.jsx';
import { getRestaurant } from '../data/restaurants.js';
import { paymentMethods } from '../data/user.js';
import { navigate } from '../lib/router.js';
import { money, formatTime } from '../lib/format.js';
import { Screen, EmptyState } from '../components/ui.jsx';
import Icon from '../components/Icon.jsx';
import './Confirmation.css';

export default function Confirmation({ id }) {
  const { getOrder, prefs } = useApp();
  const order = getOrder(id);

  if (!order) {
    return (
      <Screen label="Order confirmation">
        <EmptyState
          icon="orders"
          title="Order not found"
          text="We couldn’t find that order in this demo."
          action="Back home"
          onAction={() => navigate('/', { replace: true })}
        />
      </Screen>
    );
  }

  const r = getRestaurant(order.restaurantId);
  const pay = paymentMethods.find((p) => p.id === order.payment);
  const arriveAt = order.schedule || order.placedAt + order.etaMinutes * 60000;
  const etaRange = order.schedule ? 'Scheduled delivery' : `${r.eta[0]}–${r.eta[1]} min`;

  return (
    <Screen
      className="confirm"
      label="Order confirmation"
      footer={
        <div className="stack confirm-actions">
          <button type="button" className="btn btn-primary btn-block" onClick={() => navigate(`/tracking/${order.id}`, { replace: true })}>
            <Icon name="navigation" size={18} /> Track order
          </button>
          <button type="button" className="btn btn-ghost btn-block" onClick={() => navigate('/', { replace: true })}>
            Back home
          </button>
        </div>
      }
    >
      <div className="confirm-body pad">
        <div className="confirm-check" aria-hidden="true">
          <svg viewBox="0 0 52 52" width="72" height="72">
            <circle cx="26" cy="26" r="24" fill="none" />
            <path d="M15 27 l7 7 l15 -16" fill="none" />
          </svg>
        </div>
        <h1>Order placed!</h1>
        <p className="confirm-lead">
          Thanks, {prefs.name.split(' ')[0]}. <b>{r.name}</b> has received your order and will start preparing it shortly.
        </p>

        <dl className="confirm-card card">
          <div>
            <dt>Order number</dt>
            <dd className="confirm-id">{order.id}</dd>
          </div>
          <div>
            <dt>Estimated delivery</dt>
            <dd>
              <b>{formatTime(arriveAt)}</b> <span className="muted">· {etaRange}</span>
            </dd>
          </div>
          <div>
            <dt>Delivering to</dt>
            <dd>
              {order.address?.label} · {order.address?.line1}
            </dd>
          </div>
          <div>
            <dt>Payment</dt>
            <dd>
              {pay?.label} <span className="muted">(demo)</span>
            </dd>
          </div>
          <div className="confirm-total">
            <dt>Total</dt>
            <dd>{money(order.total)}</dd>
          </div>
        </dl>
        <p className="confirm-note">This is a demo order — nothing will actually be delivered or charged.</p>
      </div>
    </Screen>
  );
}
