import { useId, useState } from 'react';
import { useApp } from '../store/AppStore.jsx';
import { addresses as baseAddresses } from '../data/user.js';
import { Sheet } from './Overlay.jsx';
import Icon from './Icon.jsx';

export function useAddresses() {
  const { prefs } = useApp();
  const all = [...baseAddresses, ...(prefs.customAddresses || [])];
  const current = all.find((a) => a.id === prefs.addressId) || all[0];
  return { all, current };
}

export default function AddressSheet() {
  const { addressSheet, setAddressSheet, prefs, setPrefs, showToast } = useApp();
  const { all } = useAddresses();
  const [adding, setAdding] = useState(false);
  const [label, setLabel] = useState('');
  const [line1, setLine1] = useState('');
  const [error, setError] = useState('');
  const lId = useId();
  const sId = useId();

  const close = () => {
    setAddressSheet(false);
    setAdding(false);
    setError('');
  };

  const select = (id) => {
    setPrefs((p) => ({ ...p, addressId: id }));
    const a = all.find((x) => x.id === id);
    showToast(`Delivering to ${a.label}`, { tone: 'success' });
    close();
  };

  const save = (e) => {
    e.preventDefault();
    if (line1.trim().length < 5) {
      setError('Enter a street address (at least 5 characters).');
      return;
    }
    const a = { id: `a-${Date.now()}`, label: label.trim() || 'New address', line1: line1.trim(), line2: '', note: '' };
    setPrefs((p) => ({ ...p, addressId: a.id, customAddresses: [...(p.customAddresses || []), a] }));
    setLabel('');
    setLine1('');
    showToast('Address saved', { tone: 'success' });
    close();
  };

  return (
    <Sheet open={addressSheet} onClose={close} title="Delivery address">
      {!adding ? (
        <>
          <ul className="choice-list" role="list">
            {all.map((a) => (
              <li key={a.id}>
                <button
                  type="button"
                  className={`choice ${prefs.addressId === a.id ? 'is-selected' : ''}`}
                  aria-pressed={prefs.addressId === a.id}
                  onClick={() => select(a.id)}
                >
                  <span className="choice-icon" aria-hidden="true">
                    <Icon name={a.id === 'work' ? 'store' : 'pin'} size={18} />
                  </span>
                  <span className="choice-text">
                    <b>{a.label}</b>
                    <span>
                      {a.line1}
                      {a.line2 && `, ${a.line2}`}
                    </span>
                  </span>
                  {prefs.addressId === a.id && <Icon name="check" size={18} className="choice-check" />}
                </button>
              </li>
            ))}
          </ul>
          <button type="button" className="btn btn-ghost btn-block" onClick={() => setAdding(true)}>
            <Icon name="plus" size={18} /> Add new address
          </button>
        </>
      ) : (
        <form onSubmit={save} className="stack" noValidate>
          <div className="field">
            <label htmlFor={lId}>Label</label>
            <input id={lId} value={label} onChange={(e) => setLabel(e.target.value)} placeholder="E.g. Gym, Mum's" autoComplete="off" />
          </div>
          <div className="field">
            <label htmlFor={sId}>Street address</label>
            <input
              id={sId}
              value={line1}
              onChange={(e) => {
                setLine1(e.target.value);
                setError('');
              }}
              placeholder="Street, number, apartment"
              autoComplete="street-address"
              aria-invalid={!!error}
              aria-describedby={error ? `${sId}-err` : undefined}
            />
            {error && (
              <span id={`${sId}-err`} className="field-error">
                {error}
              </span>
            )}
          </div>
          <div className="row-2">
            <button type="button" className="btn btn-ghost" onClick={() => setAdding(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-dark">
              Save address
            </button>
          </div>
        </form>
      )}
    </Sheet>
  );
}
