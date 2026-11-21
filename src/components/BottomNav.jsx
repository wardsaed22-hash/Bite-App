import { useApp } from '../store/AppStore.jsx';
import { linkProps } from '../lib/router.js';
import { isActive } from '../lib/orders.js';
import Icon from './Icon.jsx';

const TABS = [
  { id: 'home', label: 'Home', icon: 'home', to: '/' },
  { id: 'search', label: 'Search', icon: 'search', to: '/search' },
  { id: 'orders', label: 'Orders', icon: 'orders', to: '/orders' },
  { id: 'favorites', label: 'Favorites', icon: 'heart', to: '/favorites' },
  { id: 'profile', label: 'Profile', icon: 'user', to: '/profile' },
];

export default function BottomNav({ active }) {
  const { orders } = useApp();
  const activeOrders = orders.filter((o) => isActive(o)).length;
  return (
    <nav className="bottom-nav" aria-label="Main">
      <ul>
        {TABS.map((t) => (
          <li key={t.id}>
            <a {...linkProps(t.to, { replace: true })} className={active === t.id ? 'is-active' : ''} aria-current={active === t.id ? 'page' : undefined}>
              <span className="nav-icon">
                <Icon name={t.icon} size={22} filled={active === t.id && t.id === 'favorites'} />
                {t.id === 'orders' && activeOrders > 0 && (
                  <span className="nav-dot">
                    <span className="sr-only">, {activeOrders} active</span>
                  </span>
                )}
              </span>
              <span className="nav-label">{t.label}</span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
