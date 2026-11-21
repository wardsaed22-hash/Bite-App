import { useId, useState } from 'react';
import { useApp } from '../store/AppStore.jsx';
import { paymentMethods, languages, faqs } from '../data/user.js';
import { linkProps } from '../lib/router.js';
import { Screen } from '../components/ui.jsx';
import { Sheet } from '../components/Overlay.jsx';
import { useAddresses } from '../components/AddressSheet.jsx';
import Icon from '../components/Icon.jsx';
import Logo from '../components/Logo.jsx';
import './Profile.css';

function Switch({ checked, onChange, label, description }) {
  const id = useId();
  return (
    <div className="switch-row">
      <span className="switch-text">
        <span id={id}>{label}</span>
        {description && <small>{description}</small>}
      </span>
      <button type="button" role="switch" aria-checked={checked} aria-labelledby={id} className="switch" onClick={() => onChange(!checked)}>
        <span />
      </button>
    </div>
  );
}

function Row({ icon, title, value, onClick, to, badge }) {
  const inner = (
    <>
      <span className="list-row-icon" aria-hidden="true">
        <Icon name={icon} size={18} />
      </span>
      <span className="list-row-text">
        <b>{title}</b>
        {value && <span>{value}</span>}
      </span>
      <span className="list-row-end">
        {badge > 0 && <span className="row-badge">{badge}</span>}
        <Icon name="chevronRight" size={18} />
      </span>
    </>
  );
  if (to)
    return (
      <a className="list-row" {...linkProps(to)}>
        {inner}
      </a>
    );
  return (
    <button type="button" className="list-row" onClick={onClick}>
      {inner}
    </button>
  );
}

export default function Profile() {
  const { prefs, setPrefs, orders, favorites, unreadCount, setAddressSheet, setConfirm, resetDemo, showToast } = useApp();
  const { current, all } = useAddresses();
  const [sheet, setSheet] = useState(null);
  const [draft, setDraft] = useState({ name: prefs.name, email: prefs.email, phone: prefs.phone });
  const ids = { name: useId(), email: useId(), phone: useId() };
  const initials = prefs.name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  const lang = languages.find((l) => l.id === prefs.language) || languages[0];
  const pay = paymentMethods.find((p) => p.id === prefs.payment);
  const close = () => setSheet(null);

  return (
    <Screen
      label="Profile"
      header={
        <header className="page-head">
          <h1>Profile</h1>
        </header>
      }
    >
      <div className="pad">
        <section className="prof-card">
          <span className="prof-avatar" aria-hidden="true">
            {initials}
          </span>
          <div className="prof-id">
            <h2>{prefs.name}</h2>
            <p>{prefs.email}</p>
          </div>
          <button
            type="button"
            className="btn btn-xs btn-ghost"
            onClick={() => {
              setDraft({ name: prefs.name, email: prefs.email, phone: prefs.phone });
              setSheet('edit');
            }}
          >
            <Icon name="edit" size={14} /> Edit
          </button>
        </section>

        <ul className="prof-stats" role="list">
          <li>
            <b>{orders.length}</b>
            <span>Orders</span>
          </li>
          <li>
            <b>{favorites.restaurants.length + favorites.dishes.length}</b>
            <span>Favorites</span>
          </li>
          <li>
            <b>{all.length}</b>
            <span>Addresses</span>
          </li>
        </ul>

        <h2 className="prof-h">Account</h2>
        <div className="list-card">
          <Row icon="pin" title="Saved addresses" value={`${current.label} · ${current.line1}`} onClick={() => setAddressSheet(true)} />
          <Row icon="card" title="Payment methods" value={`Default: ${pay?.label}`} onClick={() => setSheet('pay')} />
          <Row icon="bell" title="Notifications" value={unreadCount ? `${unreadCount} unread` : 'All caught up'} to="/notifications" badge={unreadCount} />
        </div>

        <h2 className="prof-h">Preferences</h2>
        <div className="list-card">
          <Row icon="settings" title="Notification settings" value="Orders, offers, account" onClick={() => setSheet('notif')} />
          <Row icon="globe" title="Language" value={lang.label} onClick={() => setSheet('lang')} />
        </div>

        <h2 className="prof-h">Support</h2>
        <div className="list-card">
          <Row icon="help" title="Help & FAQ" value="Orders, payments, delivery" onClick={() => setSheet('help')} />
          <Row icon="info" title="About BITE" value="Version 1.0 · portfolio demo" onClick={() => setSheet('about')} />
        </div>

        <button
          type="button"
          className="btn btn-ghost btn-block prof-logout"
          onClick={() =>
            setConfirm({
              title: 'Log out?',
              body: 'This is a demo — logging out resets all local data (cart, orders, favorites) and shows onboarding again.',
              confirmLabel: 'Log out',
              onConfirm: resetDemo,
            })
          }
        >
          <Icon name="logout" size={18} /> Log out (demo)
        </button>
        <p className="prof-foot">BITE · Good food, faster. · Demo data only</p>
      </div>
      <div className="bottom-space" />

      {/* Edit profile */}
      <Sheet
        open={sheet === 'edit'}
        onClose={close}
        title="Edit profile"
        footer={
          <button type="submit" form="profile-form" className="btn btn-dark btn-block">
            Save changes
          </button>
        }
      >
        <form
          id="profile-form"
          className="stack"
          onSubmit={(e) => {
            e.preventDefault();
            if (draft.name.trim().length < 2) return;
            setPrefs((p) => ({ ...p, name: draft.name.trim(), email: draft.email.trim(), phone: draft.phone.trim() }));
            showToast('Profile updated', { tone: 'success' });
            close();
          }}
        >
          <div className="field">
            <label htmlFor={ids.name}>Full name</label>
            <input
              id={ids.name}
              value={draft.name}
              onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
              autoComplete="name"
              required
              minLength={2}
            />
          </div>
          <div className="field">
            <label htmlFor={ids.email}>Email</label>
            <input
              id={ids.email}
              type="email"
              inputMode="email"
              value={draft.email}
              onChange={(e) => setDraft((d) => ({ ...d, email: e.target.value }))}
              autoComplete="email"
            />
          </div>
          <div className="field">
            <label htmlFor={ids.phone}>Phone</label>
            <input
              id={ids.phone}
              type="tel"
              inputMode="tel"
              value={draft.phone}
              onChange={(e) => setDraft((d) => ({ ...d, phone: e.target.value }))}
              autoComplete="tel"
            />
          </div>
          <p className="field-hint prof-hint">Stored only in this browser (localStorage).</p>
        </form>
      </Sheet>

      {/* Payment methods */}
      <Sheet open={sheet === 'pay'} onClose={close} title="Payment methods">
        <ul className="choice-list" role="list">
          {paymentMethods.map((m) => (
            <li key={m.id}>
              <button
                type="button"
                className={`choice ${prefs.payment === m.id ? 'is-selected' : ''}`}
                aria-pressed={prefs.payment === m.id}
                onClick={() => {
                  setPrefs((p) => ({ ...p, payment: m.id }));
                  showToast(`${m.label} set as default`, { tone: 'success' });
                }}
              >
                <span className="choice-icon" aria-hidden="true">
                  <Icon name={m.icon} size={18} />
                </span>
                <span className="choice-text">
                  <b>{m.label}</b>
                  <span>{m.detail}</span>
                </span>
                {prefs.payment === m.id && <span className="badge badge-neutral">Default</span>}
              </button>
            </li>
          ))}
        </ul>
        <p className="notice">
          <Icon name="shield" size={16} />
          <span>Payment methods are illustrative. BITE never asks for or stores real card details.</span>
        </p>
      </Sheet>

      {/* Notification settings */}
      <Sheet open={sheet === 'notif'} onClose={close} title="Notification settings">
        <div className="switch-list">
          <Switch
            label="Order updates"
            description="Status changes and delivery alerts"
            checked={prefs.notify.orders}
            onChange={(v) => setPrefs((p) => ({ ...p, notify: { ...p.notify, orders: v } }))}
          />
          <Switch
            label="Offers & promotions"
            description="Deals from restaurants near you"
            checked={prefs.notify.offers}
            onChange={(v) => setPrefs((p) => ({ ...p, notify: { ...p.notify, offers: v } }))}
          />
          <Switch
            label="Account activity"
            description="Security and profile changes"
            checked={prefs.notify.account}
            onChange={(v) => setPrefs((p) => ({ ...p, notify: { ...p.notify, account: v } }))}
          />
        </div>
      </Sheet>

      {/* Language */}
      <Sheet open={sheet === 'lang'} onClose={close} title="Language">
        <fieldset>
          <legend className="sr-only">App language</legend>
          <div className="opt-list">
            {languages.map((l) => (
              <label key={l.id} className={`opt ${prefs.language === l.id ? 'is-checked' : ''}`}>
                <input
                  type="radio"
                  name="lang"
                  checked={prefs.language === l.id}
                  onChange={() => {
                    setPrefs((p) => ({ ...p, language: l.id }));
                    showToast(`Language set to ${l.label} (demo — UI stays in English)`);
                  }}
                />
                <span className="opt-mark opt-radio" aria-hidden="true" />
                <span className="opt-label" lang={l.id}>
                  {l.label}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      </Sheet>

      {/* Help */}
      <Sheet open={sheet === 'help'} onClose={close} title="Help & FAQ">
        <div className="faq">
          {faqs.map((f) => (
            <details key={f.q}>
              <summary>
                {f.q}
                <Icon name="chevronDown" size={18} />
              </summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
        <button type="button" className="btn btn-ghost btn-block gap-top" onClick={() => showToast('Support chat is not available in this demo')}>
          <Icon name="message" size={18} /> Chat with support
        </button>
      </Sheet>

      {/* About */}
      <Sheet open={sheet === 'about'} onClose={close} title="About BITE">
        <div className="about">
          <Logo size={40} />
          <p>
            <b>Good food, faster.</b> BITE is a mobile-first food ordering concept built for a design portfolio.
          </p>
          <p className="muted">
            All restaurants, dishes, prices and people are fictional. There is no backend, no real ordering and no payment processing. Data is stored only in
            your browser.
          </p>
        </div>
      </Sheet>
    </Screen>
  );
}
