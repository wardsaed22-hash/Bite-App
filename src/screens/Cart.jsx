import { useId, useState } from 'react';
import { useApp } from '../store/AppStore.jsx';
import { PROMO_CODES } from '../lib/pricing.js';
import { linkProps, navigate } from '../lib/router.js';
import { money, foodImg, etaText, plural } from '../lib/format.js';
import { Screen, TopBar, Stepper, EmptyState, RestaurantAvatar } from '../components/ui.jsx';
import Img from '../components/Img.jsx';
import Icon from '../components/Icon.jsx';
import './Cart.css';

export function Totals({ t, showPromoHint = false }) {
  return (
    <dl className="summary">
      <div className="summary-row">
        <dt>Subtotal</dt>
        <dd>{money(t.subtotal)}</dd>
      </div>
      <div className="summary-row">
        <dt>Delivery fee</dt>
        <dd className={t.deliveryFee === 0 ? 'is-free-text' : ''}>{t.deliveryFee === 0 ? 'Free' : money(t.deliveryFee)}</dd>
      </div>
      <div className={`summary-row ${t.discount ? 'is-discount' : ''}`}>
        <dt>Discount{t.promo && ` (${t.promoCode || ''})`}</dt>
        <dd>{t.discount ? `−${money(t.discount)}` : showPromoHint ? <span className="muted">Add a code</span> : '—'}</dd>
      </div>
      <div className="summary-row is-total">
        <dt>Total</dt>
        <dd>{money(t.total)}</dd>
      </div>
    </dl>
  );
}

function PromoField() {
  const { cart, applyPromo, removePromo, showToast } = useApp();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const id = useId();

  if (cart.promo) {
    return (
      <div className="promo-applied">
        <span className="promo-applied-icon" aria-hidden="true">
          <Icon name="percent" size={16} />
        </span>
        <span className="promo-applied-text">
          <b>{cart.promo}</b>
          <span>{PROMO_CODES[cart.promo].label}</span>
        </span>
        <button type="button" className="btn btn-xs btn-ghost" onClick={removePromo}>
          Remove
        </button>
      </div>
    );
  }

  return (
    <form
      className="promo-form"
      onSubmit={(e) => {
        e.preventDefault();
        if (!code.trim()) return setError('Enter a promo code.');
        if (applyPromo(code)) {
          showToast('Promo code applied', { tone: 'success' });
          setCode('');
          setError('');
        } else setError('That code isn’t valid. Try BITE20 or WELCOME5.');
      }}
      noValidate
    >
      <label htmlFor={id} className="field-label">
        Promo code
      </label>
      <div className="promo-row">
        <input
          id={id}
          className="input"
          value={code}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase());
            setError('');
          }}
          placeholder="Enter code"
          autoCapitalize="characters"
          autoComplete="off"
          enterKeyHint="done"
          aria-invalid={!!error}
          aria-describedby={`${id}-msg`}
        />
        <button type="submit" className="btn btn-dark btn-sm">
          Apply
        </button>
      </div>
      <p id={`${id}-msg`} className={error ? 'field-error' : 'field-hint promo-hint'}>
        {error || 'Demo codes: BITE20 (20% off) · WELCOME5 ($5 off)'}
      </p>
    </form>
  );
}

export default function Cart() {
  const { totals, cart, setQty, removeItem, openDish, clearCart, setConfirm } = useApp();
  const r = totals.restaurant;
  const empty = !totals.lines.length;

  const header = (
    <TopBar
      title="Your cart"
      subtitle={empty ? undefined : plural(totals.count, 'item')}
      fallback="/"
      actions={
        !empty && (
          <button
            type="button"
            className="icon-btn"
            aria-label="Clear cart"
            onClick={() =>
              setConfirm({
                title: 'Clear your cart?',
                body: `All ${plural(totals.count, 'item')} from ${r.name} will be removed.`,
                confirmLabel: 'Clear cart',
                onConfirm: clearCart,
              })
            }
          >
            <Icon name="trash" size={18} />
          </button>
        )
      }
    />
  );

  if (empty) {
    return (
      <Screen header={header} label="Cart">
        <EmptyState
          icon="bag"
          title="Your cart is empty"
          text="Add something delicious from a restaurant near you and it will show up here."
          action="Browse restaurants"
          to="/"
        />
      </Screen>
    );
  }

  return (
    <Screen
      header={header}
      className="cart"
      label="Cart"
      footer={
        <button type="button" className="btn btn-primary btn-block btn-grow" onClick={() => navigate('/checkout')}>
          <span>Go to checkout</span>
          <span className="btn-price">{money(totals.total)}</span>
        </button>
      }
    >
      <div className="pad">
        <a className="cart-rest" {...linkProps(`/restaurant/${r.id}`)}>
          <RestaurantAvatar restaurant={r} size={44} />
          <span className="cart-rest-text">
            <b>{r.name}</b>
            <span>
              <Icon name="clock" size={13} /> {etaText(r.eta)} · Add more items
            </span>
          </span>
          <Icon name="chevronRight" size={18} />
        </a>

        <ul className="cart-items" role="list" aria-label="Items in your cart">
          {totals.lines.map((l) => (
            <li key={l.key} className="cart-item">
              <Img src={foodImg(l.dish.image, true)} alt="" className="cart-item-img" width="240" height="240" />
              <div className="cart-item-body">
                <div className="cart-item-top">
                  <h3>{l.dish.name}</h3>
                  <span className="cart-item-price">{money(l.line)}</span>
                </div>
                {l.optionsText && <p className="cart-item-opts">{l.optionsText}</p>}
                {l.notes && <p className="cart-item-note">“{l.notes}”</p>}
                <div className="cart-item-actions">
                  <Stepper
                    size="sm"
                    value={l.qty}
                    min={1}
                    allowRemove
                    label={`Quantity of ${l.dish.name}`}
                    onChange={(v) => (v < 1 ? removeItem(l.key) : setQty(l.key, v))}
                  />
                  <button type="button" className="btn btn-xs cart-link" onClick={() => openDish(l.dishId, l)} aria-label={`Edit ${l.dish.name}`}>
                    Edit
                  </button>
                  <button type="button" className="btn btn-xs cart-link" onClick={() => removeItem(l.key)} aria-label={`Remove ${l.dish.name}`}>
                    Remove
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <div className="card gap-top">
          <PromoField />
        </div>

        <section className="card gap-top" aria-label="Price summary">
          <Totals t={{ ...totals, promoCode: cart.promo }} showPromoHint />
        </section>
        <p className="cart-fine">Prices shown are demo values. No real order or payment is made.</p>
      </div>
      <div className="bottom-space" />
    </Screen>
  );
}
