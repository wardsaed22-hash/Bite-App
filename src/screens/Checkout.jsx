import { useId, useMemo, useRef, useState } from 'react';
import { useApp } from '../store/AppStore.jsx';
import { paymentMethods } from '../data/user.js';
import { navigate } from '../lib/router.js';
import { money, formatTime, etaText } from '../lib/format.js';
import { Screen, TopBar, EmptyState } from '../components/ui.jsx';
import { useAddresses } from '../components/AddressSheet.jsx';
import Icon from '../components/Icon.jsx';
import { Totals } from './Cart.jsx';
import './Cart.css';
import './Checkout.css';

function timeSlots(count = 6) {
  const d = new Date();
  d.setMinutes(d.getMinutes() + 60);
  d.setMinutes(d.getMinutes() < 30 ? 30 : 60, 0, 0);
  return Array.from({ length: count }, (_, i) => new Date(d.getTime() + i * 30 * 60000).getTime());
}

export default function Checkout() {
  const { totals, cart, prefs, setPrefs, placeOrder, setAddressSheet } = useApp();
  const { current: address } = useAddresses();
  const [when, setWhen] = useState('asap');
  const slots = useMemo(() => timeSlots(), []);
  const [slot, setSlot] = useState(slots[0]);
  const [name, setName] = useState(prefs.name);
  const [phone, setPhone] = useState(prefs.phone);
  const [instructions, setInstructions] = useState(address.note || '');
  const [payment, setPayment] = useState(prefs.payment || 'card');
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const nameRef = useRef(null);
  const phoneRef = useRef(null);
  const ids = { name: useId(), phone: useId(), notes: useId() };
  // Keep the restaurant around while the cart is cleared during order placement.
  const restRef = useRef(totals.restaurant);
  if (totals.restaurant) restRef.current = totals.restaurant;
  const r = restRef.current;

  if (!r || (!totals.lines.length && !busy)) {
    return (
      <Screen header={<TopBar title="Checkout" fallback="/cart" />} label="Checkout">
        <EmptyState icon="bag" title="Nothing to check out" text="Your cart is empty. Add a few dishes first." action="Browse restaurants" to="/" />
      </Screen>
    );
  }

  const validate = () => {
    const e = {};
    if (name.trim().length < 2) e.name = 'Please enter your name.';
    if (phone.replace(/\D/g, '').length < 7) e.phone = 'Enter a valid phone number (at least 7 digits).';
    setErrors(e);
    if (e.name) nameRef.current?.focus();
    else if (e.phone) phoneRef.current?.focus();
    return !Object.keys(e).length;
  };

  const submit = (ev) => {
    ev.preventDefault();
    if (busy || !validate()) return;
    setBusy(true);
    setPrefs((p) => ({ ...p, name: name.trim(), phone: phone.trim(), payment }));
    // Simulated network latency — nothing leaves the browser.
    setTimeout(() => {
      const order = placeOrder({
        address: { label: address.label, line1: address.line1, line2: address.line2 },
        instructions: instructions.trim(),
        contact: { name: name.trim(), phone: phone.trim() },
        payment,
        schedule: when === 'later' ? slot : null,
      });
      navigate(`/confirmation/${order.id}`, { replace: true });
    }, 1100);
  };

  return (
    <Screen
      header={<TopBar title="Checkout" subtitle={r?.name} fallback="/cart" />}
      className="checkout"
      label="Checkout"
      footer={
        <button type="submit" form="checkout-form" className={`btn btn-primary btn-block btn-grow ${busy ? 'is-loading' : ''}`} aria-busy={busy}>
          {busy ? (
            <>
              <span>Placing order…</span>
              <span className="spinner" aria-hidden="true" />
            </>
          ) : (
            <>
              <span>Place order</span>
              <span className="btn-price">{money(totals.total)}</span>
            </>
          )}
        </button>
      }
    >
      <form id="checkout-form" className="co pad" onSubmit={submit} noValidate>
        {/* 1 — Address */}
        <section className="co-sec" aria-labelledby="co-addr">
          <h2 id="co-addr" className="co-h">
            <span className="co-n">1</span> Delivery address
          </h2>
          <div className="card co-addr">
            <span className="co-addr-icon" aria-hidden="true">
              <Icon name="pin" size={18} />
            </span>
            <span className="co-addr-text">
              <b>{address.label}</b>
              <span>
                {address.line1}
                {address.line2 && `, ${address.line2}`}
              </span>
            </span>
            <button type="button" className="btn btn-xs btn-ghost" onClick={() => setAddressSheet(true)}>
              Change
            </button>
          </div>
          <div className="field gap-top">
            <label htmlFor={ids.notes}>
              Instructions for the courier <span className="muted">(optional)</span>
            </label>
            <input
              id={ids.notes}
              value={instructions}
              maxLength={100}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Gate code, floor, leave at door…"
              autoComplete="off"
            />
          </div>
        </section>

        {/* 2 — Time */}
        <section className="co-sec" aria-labelledby="co-time">
          <h2 id="co-time" className="co-h">
            <span className="co-n">2</span> Delivery time
          </h2>
          <div className="co-time" role="radiogroup" aria-labelledby="co-time">
            <label className={`co-opt ${when === 'asap' ? 'is-on' : ''}`}>
              <input type="radio" name="when" value="asap" checked={when === 'asap'} onChange={() => setWhen('asap')} />
              <Icon name="bike" size={20} />
              <span>
                <b>Standard</b>
                <span>{etaText(r.eta)}</span>
              </span>
            </label>
            <label className={`co-opt ${when === 'later' ? 'is-on' : ''}`}>
              <input type="radio" name="when" value="later" checked={when === 'later'} onChange={() => setWhen('later')} />
              <Icon name="clock" size={20} />
              <span>
                <b>Schedule</b>
                <span>Pick a time</span>
              </span>
            </label>
          </div>
          {when === 'later' && (
            <div className="co-slots" role="radiogroup" aria-label="Delivery time slot">
              {slots.map((s) => (
                <button key={s} type="button" role="radio" aria-checked={slot === s} className="chip" aria-pressed={slot === s} onClick={() => setSlot(s)}>
                  {formatTime(s)}
                </button>
              ))}
            </div>
          )}
        </section>

        {/* 3 — Contact */}
        <section className="co-sec" aria-labelledby="co-contact">
          <h2 id="co-contact" className="co-h">
            <span className="co-n">3</span> Contact details
          </h2>
          <div className="stack">
            <div className="field">
              <label htmlFor={ids.name}>Full name</label>
              <input
                ref={nameRef}
                id={ids.name}
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setErrors((x) => ({ ...x, name: undefined }));
                }}
                autoComplete="name"
                enterKeyHint="next"
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? `${ids.name}-e` : undefined}
              />
              {errors.name && (
                <span id={`${ids.name}-e`} className="field-error" role="alert">
                  {errors.name}
                </span>
              )}
            </div>
            <div className="field">
              <label htmlFor={ids.phone}>Phone number</label>
              <input
                ref={phoneRef}
                id={ids.phone}
                type="tel"
                inputMode="tel"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  setErrors((x) => ({ ...x, phone: undefined }));
                }}
                autoComplete="tel"
                enterKeyHint="done"
                aria-invalid={!!errors.phone}
                aria-describedby={errors.phone ? `${ids.phone}-e` : `${ids.phone}-h`}
              />
              {errors.phone ? (
                <span id={`${ids.phone}-e`} className="field-error" role="alert">
                  {errors.phone}
                </span>
              ) : (
                <span id={`${ids.phone}-h`} className="field-hint co-hint">
                  Your courier may call if they can’t find you.
                </span>
              )}
            </div>
          </div>
        </section>

        {/* 4 — Payment */}
        <section className="co-sec" aria-labelledby="co-pay">
          <h2 id="co-pay" className="co-h">
            <span className="co-n">4</span> Payment method
          </h2>
          <div className="co-pay" role="radiogroup" aria-labelledby="co-pay">
            {paymentMethods.map((m) => (
              <label key={m.id} className={`co-pay-opt ${payment === m.id ? 'is-on' : ''}`}>
                <input type="radio" name="payment" value={m.id} checked={payment === m.id} onChange={() => setPayment(m.id)} />
                <span className="co-pay-icon" aria-hidden="true">
                  <Icon name={m.icon} size={20} />
                </span>
                <span className="co-pay-text">
                  <b>{m.label}</b>
                  <span>{m.detail}</span>
                </span>
                <span className="opt-mark opt-radio" aria-hidden="true" />
              </label>
            ))}
          </div>
          <p className="notice gap-top">
            <Icon name="shield" size={16} />
            <span>
              <b>Demo only.</b> No card numbers or payment details are requested, collected or sent anywhere.
            </span>
          </p>
        </section>

        {/* 5 — Summary */}
        <section className="co-sec" aria-labelledby="co-sum">
          <h2 id="co-sum" className="co-h">
            <span className="co-n">5</span> Order summary
          </h2>
          <div className="card">
            <ul className="co-lines" role="list">
              {totals.lines.map((l) => (
                <li key={l.key}>
                  <span className="co-qty">{l.qty}×</span>
                  <span className="co-line-text">
                    <b>{l.dish.name}</b>
                    {l.optionsText && <span>{l.optionsText}</span>}
                    {l.notes && <span>“{l.notes}”</span>}
                  </span>
                  <span className="co-line-price">{money(l.line)}</span>
                </li>
              ))}
            </ul>
            <Totals t={{ ...totals, promoCode: cart.promo }} />
          </div>
        </section>
      </form>
      <div className="bottom-space" />
    </Screen>
  );
}
