import { useState } from 'react';
import { useApp } from '../store/AppStore.jsx';
import { navigate } from '../lib/router.js';
import { relativeTime } from '../lib/format.js';
import { Screen, TopBar, EmptyState } from '../components/ui.jsx';
import Icon from '../components/Icon.jsx';
import './Notifications.css';

const TYPES = [
  { id: 'all', label: 'All' },
  { id: 'order', label: 'Orders' },
  { id: 'offer', label: 'Offers' },
  { id: 'account', label: 'Account' },
];
const ICON = { order: 'bag', offer: 'percent', account: 'shield' };

export default function Notifications() {
  const { notifications, markRead, markAllRead, unreadCount } = useApp();
  const [type, setType] = useState('all');
  const list = notifications.filter((n) => type === 'all' || n.type === type).sort((a, b) => b.at - a.at);
  const unreadIn = (t) => notifications.filter((n) => !n.read && (t === 'all' || n.type === t)).length;

  return (
    <Screen header={<TopBar title="Notifications" subtitle={unreadCount ? `${unreadCount} unread` : 'All caught up'} fallback="/" />} label="Notifications">
      <div className="ntf-tools pad">
        <ul className="chips" role="list" aria-label="Filter notifications">
          {TYPES.map((t) => {
            const u = unreadIn(t.id);
            return (
              <li key={t.id}>
                <button type="button" className="chip" aria-pressed={type === t.id} onClick={() => setType(t.id)}>
                  {t.label}
                  {u > 0 && (
                    <span className="ntf-count" aria-label={`${u} unread`}>
                      {u}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
        <button type="button" className="link-btn" onClick={markAllRead} disabled={!unreadCount}>
          <Icon name="check" size={16} /> Mark all as read
        </button>
      </div>

      {list.length ? (
        <ul className="ntf-list" role="list">
          {list.map((n) => (
            <li key={n.id}>
              <button
                type="button"
                className={`ntf ${n.read ? '' : 'is-unread'}`}
                onClick={() => {
                  markRead(n.id);
                  if (n.link) navigate(n.link);
                }}
              >
                <span className={`ntf-icon ntf-${n.type}`} aria-hidden="true">
                  <Icon name={ICON[n.type]} size={18} />
                </span>
                <span className="ntf-text">
                  <span className="ntf-title">
                    {!n.read && <span className="sr-only">Unread: </span>}
                    {n.title}
                  </span>
                  <span className="ntf-body">{n.body}</span>
                  <span className="ntf-time">{relativeTime(n.at)}</span>
                </span>
                {!n.read && <span className="ntf-dot" aria-hidden="true" />}
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState icon="bell" title="Nothing here yet" text="We’ll let you know about order updates, offers and account activity." />
      )}
      <div className="bottom-space" />
    </Screen>
  );
}
