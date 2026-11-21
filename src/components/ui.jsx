// Small shared building blocks.
import { useLayoutEffect, useRef } from 'react';
import { useApp } from '../store/AppStore.jsx';
import { goBack, navigate, linkProps, useRoute } from '../lib/router.js';
import { money, plural } from '../lib/format.js';
import Icon, { Star } from './Icon.jsx';

const scrollMemory = new Map();

/** Restores scroll position when returning to a screen via back navigation. */
function useScrollMemory(ref) {
  const route = useRoute();
  const key = route.href;
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    if (route.direction === 'back' && scrollMemory.has(key)) el.scrollTop = scrollMemory.get(key);
    const onScroll = () => scrollMemory.set(key, el.scrollTop);
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
}

export function Screen({ header, children, footer, className = '', bodyRef, label, ...rest }) {
  const localRef = useRef(null);
  const ref = bodyRef || localRef;
  useScrollMemory(ref);
  return (
    <div className={`screen ${className}`}>
      {header}
      <main id="main" className="screen-body" ref={ref} tabIndex={-1} aria-label={label} {...rest}>
        {children}
      </main>
      {footer && <div className="screen-footer">{footer}</div>}
    </div>
  );
}

export function TopBar({ title, subtitle, back = true, fallback = '/', actions, transparent = false, center = true }) {
  return (
    <header className={`topbar ${transparent ? 'is-transparent' : ''} ${center ? 'is-center' : ''}`}>
      <div className="topbar-side">
        {back && (
          <button type="button" className="icon-btn" onClick={() => goBack(fallback)} aria-label="Go back">
            <Icon name="back" />
          </button>
        )}
      </div>
      <div className="topbar-title">
        {title && <h1>{title}</h1>}
        {subtitle && <p>{subtitle}</p>}
      </div>
      <div className="topbar-side is-end">{actions}</div>
    </header>
  );
}

export function SectionHead({ title, action, to, id }) {
  return (
    <div className="section-head">
      <h2 id={id}>{title}</h2>
      {action && to && (
        <a className="link-btn" {...linkProps(to)}>
          {action}
          <Icon name="chevronRight" size={16} />
        </a>
      )}
    </div>
  );
}

export function Rating({ value, count, compact = false }) {
  return (
    <span className="rating" aria-label={`Rated ${value} out of 5${count ? ` from ${count} reviews` : ''}`}>
      <Star />
      <b>{value.toFixed(1)}</b>
      {!compact && count != null && <span className="muted">({count})</span>}
    </span>
  );
}

export function Stepper({ value, onChange, min = 1, max = 99, label = 'Quantity', size = 'md', allowRemove = false }) {
  const atMin = value <= min;
  return (
    <div className={`stepper stepper-${size}`} role="group" aria-label={label}>
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        disabled={atMin && !allowRemove}
        aria-label={atMin && allowRemove ? 'Remove item' : 'Decrease quantity'}
      >
        <Icon name={atMin && allowRemove ? 'trash' : 'minus'} size={size === 'sm' ? 16 : 18} />
      </button>
      <output aria-live="polite" aria-label={`${label}: ${value}`}>
        {value}
      </output>
      <button type="button" onClick={() => onChange(value + 1)} disabled={value >= max} aria-label="Increase quantity">
        <Icon name="plus" size={size === 'sm' ? 16 : 18} />
      </button>
    </div>
  );
}

export function EmptyState({ icon = 'bag', title, text, action, onAction, to }) {
  return (
    <div className="empty">
      <div className="empty-icon" aria-hidden="true">
        <Icon name={icon} size={28} />
      </div>
      <h2>{title}</h2>
      {text && <p>{text}</p>}
      {action && (
        <button type="button" className="btn btn-dark btn-sm" onClick={onAction || (() => navigate(to))}>
          {action}
        </button>
      )}
    </div>
  );
}

export function FavButton({ kind, id, name, className = '', size = 20 }) {
  const { isFavorite, toggleFavorite } = useApp();
  const on = isFavorite(kind, id);
  return (
    <button
      type="button"
      className={`fav-btn ${on ? 'is-on' : ''} ${className}`}
      aria-pressed={on}
      aria-label={on ? `Remove ${name} from favorites` : `Save ${name} to favorites`}
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        toggleFavorite(kind, id);
      }}
    >
      <Icon name="heart" size={size} filled={on} />
    </button>
  );
}

export function RestaurantAvatar({ restaurant, size = 44 }) {
  return (
    <span
      className="r-avatar"
      style={{ '--c': restaurant.color, width: size, height: size, fontSize: size * (restaurant.initials.length > 2 ? 0.28 : 0.36) }}
      aria-hidden="true"
    >
      {restaurant.initials}
    </span>
  );
}

/** Floating pill showing the cart summary; sits above the bottom nav. */
export function CartBar({ restaurantId }) {
  const { totals, cart } = useApp();
  if (!totals.count) return null;
  if (restaurantId && cart.restaurantId !== restaurantId) return null;
  return (
    <div className="cartbar-wrap">
      <a className="cartbar" {...linkProps('/cart')}>
        <span className="cartbar-count" aria-hidden="true">
          {totals.count}
        </span>
        <span className="cartbar-text">
          <b>View cart</b>
          <span>{totals.restaurant?.name}</span>
        </span>
        <span className="cartbar-total">
          <span className="sr-only">{plural(totals.count, 'item')}, subtotal </span>
          {money(totals.subtotal)}
        </span>
      </a>
    </div>
  );
}

export function Segmented({ value, onChange, options, label }) {
  return (
    <div className="segmented" role="tablist" aria-label={label}>
      {options.map((o) => (
        <button key={o.id} type="button" role="tab" aria-selected={value === o.id} className={value === o.id ? 'is-active' : ''} onClick={() => onChange(o.id)}>
          {o.label}
          {o.count != null && <span className="seg-count">{o.count}</span>}
        </button>
      ))}
    </div>
  );
}

export function DietBadges({ dietary = [] }) {
  if (!dietary.length) return null;
  return (
    <span className="diet">
      {dietary.includes('vegan') && (
        <span className="diet-badge is-veg" title="Vegan">
          <Icon name="leaf" size={12} /> Vegan
        </span>
      )}
      {dietary.includes('veg') && (
        <span className="diet-badge is-veg" title="Vegetarian">
          <Icon name="leaf" size={12} /> Veg
        </span>
      )}
      {dietary.includes('spicy') && (
        <span className="diet-badge is-spicy" title="Spicy">
          <Icon name="flame" size={12} /> Spicy
        </span>
      )}
    </span>
  );
}
