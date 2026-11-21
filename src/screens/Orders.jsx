import { useState } from 'react';
import { useApp } from '../store/AppStore.jsx';
import { getRestaurant } from '../data/restaurants.js';
import { ORDER_STEPS } from '../data/orders.js';
import { linkProps, navigate } from '../lib/router.js';
import { money, restaurantImg, formatDay, formatTime } from '../lib/format.js';
import { isActive, orderProgress, minutesLeft } from '../lib/orders.js';
import { useNow, itemsSummary } from '../lib/useNow.js';
import { Screen, Segmented, EmptyState } from '../components/ui.jsx';
import Img from '../components/Img.jsx';
import Icon from '../components/Icon.jsx';
import './Orders.css';

function ActiveOrder({ order, now }) {
  const r = getRestaurant(order.restaurantId);
  const { step, progress } = orderProgress(order, now);
  return (
    <article className="ord ord-active">
      <div className="ord-top">
        <Img src={restaurantImg(r.image, true)} alt="" className="ord-img" width="560" height="340" />
        <div className="ord-head">
          <h3>
            <a className="stretched" {...linkProps(`/tracking/${order.id}`)}>
              {r.name}
            </a>
          </h3>
          <p className="ord-sub">
            {order.id} · {formatTime(order.placedAt)}
          </p>
        </div>
        <span className="ord-eta">
          <b>{minutesLeft(order, now)}</b> min
        </span>
      </div>
      <p className="ord-status">
        <span className="live-dot" aria-hidden="true" /> {ORDER_STEPS[step].label}
      </p>
      <div className="ord-bar" aria-hidden="true">
        <span style={{ width: `${Math.max(5, progress * 100)}%` }} />
      </div>
      <p className="ord-items">{itemsSummary(order.items, 3)}</p>
      <span className="btn btn-dark btn-sm btn-block ord-cta" aria-hidden="true">
        <Icon name="navigation" size={16} /> Track order
      </span>
    </article>
  );
}

function PastOrder({ order }) {
  const { reorder } = useApp();
  const r = getRestaurant(order.restaurantId);
  const cancelled = order.status === 'cancelled';
  const count = order.items.reduce((a, i) => a + i.qty, 0);
  return (
    <article className="ord">
      <div className="ord-top">
        <Img src={restaurantImg(r.image, true)} alt="" className="ord-img" width="560" height="340" />
        <div className="ord-head">
          <h3>{r.name}</h3>
          <p className="ord-sub">
            {formatDay(order.placedAt)} · {count} item{count > 1 ? 's' : ''}
          </p>
        </div>
        <span className="ord-total">{money(order.total)}</span>
      </div>
      <p className="ord-items">{itemsSummary(order.items, 3)}</p>
      <div className="ord-foot">
        <span className={`badge ${cancelled ? 'badge-neutral' : 'badge-green'}`}>{cancelled ? 'Cancelled · refunded' : 'Delivered'}</span>
        <div className="ord-actions">
          <button
            type="button"
            className="btn btn-xs btn-ghost"
            onClick={() => navigate(`/tracking/${order.id}`)}
            aria-label={`View details of ${r.name} order ${order.id}`}
          >
            Details
          </button>
          <button type="button" className="btn btn-xs btn-dark" onClick={() => reorder(order)} aria-label={`Reorder from ${r.name}`}>
            <Icon name="refresh" size={14} /> Reorder
          </button>
        </div>
      </div>
    </article>
  );
}

export default function Orders() {
  const { orders } = useApp();
  const anyActive = orders.some((o) => isActive(o));
  const now = useNow(1000, anyActive);
  const active = orders.filter((o) => isActive(o, now));
  const past = orders.filter((o) => !isActive(o, now));
  const [tab, setTab] = useState(active.length ? 'active' : 'past');

  return (
    <Screen
      label="Orders"
      header={
        <header className="page-head">
          <h1>Orders</h1>
        </header>
      }
    >
      <Segmented
        label="Order type"
        value={tab}
        onChange={setTab}
        options={[
          { id: 'active', label: 'Active', count: active.length },
          { id: 'past', label: 'Past orders', count: past.length },
        ]}
      />
      <div className="ord-list pad" role="tabpanel" aria-label={tab === 'active' ? 'Active orders' : 'Past orders'}>
        {tab === 'active' ? (
          active.length ? (
            active.map((o) => <ActiveOrder key={o.id} order={o} now={now} />)
          ) : (
            <EmptyState
              icon="bike"
              title="No active orders"
              text="When you place an order, you can follow it live from here."
              action="Find something to eat"
              to="/"
            />
          )
        ) : past.length ? (
          past.map((o) => <PastOrder key={o.id} order={o} />)
        ) : (
          <EmptyState icon="orders" title="No past orders yet" text="Your order history will appear here." />
        )}
      </div>
      <div className="bottom-space" />
    </Screen>
  );
}
