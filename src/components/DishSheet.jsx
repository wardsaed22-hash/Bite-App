import { useEffect, useId, useState } from 'react';
import { useApp } from '../store/AppStore.jsx';
import { getDish, getOptions } from '../data/dishes.js';
import { getRestaurant } from '../data/restaurants.js';
import { defaultSize, unitPrice } from '../lib/pricing.js';
import { money, foodImg } from '../lib/format.js';
import { navigate } from '../lib/router.js';
import { Sheet } from './Overlay.jsx';
import { Stepper, FavButton, DietBadges } from './ui.jsx';
import Img from './Img.jsx';
import Icon from './Icon.jsx';

/** Food details: size, extras, notes and quantity, as a near-full-height bottom sheet. */
export default function DishSheet() {
  const { dishSheet, closeDish, addToCart } = useApp();
  const [last, setLast] = useState(dishSheet);
  useEffect(() => {
    if (dishSheet) setLast(dishSheet);
  }, [dishSheet]);
  const data = dishSheet || last;
  const dish = data ? getDish(data.dishId) : null;
  const edit = data?.edit;

  const [size, setSize] = useState(null);
  const [extras, setExtras] = useState([]);
  const [qty, setQty] = useState(1);
  const [notes, setNotes] = useState('');
  const notesId = useId();

  useEffect(() => {
    if (!dishSheet) return;
    const d = getDish(dishSheet.dishId);
    const e = dishSheet.edit;
    setSize(e?.size ?? defaultSize(d));
    setExtras(e?.extras ?? []);
    setQty(e?.qty ?? 1);
    setNotes(e?.notes ?? '');
  }, [dishSheet]);

  if (!dish) return null;
  const opts = getOptions(dish);
  const restaurant = getRestaurant(dish.restaurantId);
  const unit = unitPrice(dish, size, extras);
  const total = unit * qty;

  const toggleExtra = (id) => setExtras((x) => (x.includes(id) ? x.filter((i) => i !== id) : [...x, id]));

  const submit = () => {
    addToCart({ dishId: dish.id, qty, size, extras, notes: notes.trim() }, { editKey: edit?.key, onDone: closeDish });
  };

  return (
    <Sheet
      open={!!dishSheet}
      onClose={closeDish}
      title={dish.name}
      hideTitle
      full
      flush
      className="sheet-dish"
      footer={
        <div className="dish-footer">
          <Stepper value={qty} onChange={(v) => setQty(Math.max(1, v))} label={`Quantity of ${dish.name}`} />
          <button type="button" className="btn btn-primary btn-grow" onClick={submit}>
            <span>{edit ? 'Update item' : 'Add to cart'}</span>
            <span className="btn-price">{money(total)}</span>
          </button>
        </div>
      }
    >
      <div className="dish-hero">
        <Img src={foodImg(dish.image)} alt={dish.name} width="720" height="720" eager />
        <button type="button" className="icon-btn icon-btn-float dish-close" onClick={closeDish} aria-label="Close dish details">
          <Icon name="x" />
        </button>
        <FavButton kind="dishes" id={dish.id} name={dish.name} className="icon-btn-float dish-fav" />
      </div>

      <div className="dish-content">
        <button
          type="button"
          className="dish-rest-link"
          onClick={() => {
            closeDish();
            navigate(`/restaurant/${restaurant.id}`);
          }}
        >
          {restaurant.name}
          <Icon name="chevronRight" size={14} />
        </button>
        <h2 className="dish-name">{dish.name}</h2>
        <div className="dish-badges">
          {dish.popular && <span className="badge badge-hot">Popular</span>}
          <DietBadges dietary={dish.dietary} />
        </div>
        <p className="dish-desc">{dish.description}</p>
        <p className="dish-price-line">
          <b>{money(dish.price)}</b>
          {dish.kcal && <span className="muted"> · {dish.kcal} kcal</span>}
        </p>

        {opts.sizes.length > 1 && (
          <fieldset className="opt-group">
            <legend>
              <span>{opts.sizeLabel || 'Size'}</span>
              <span className="opt-req">Required</span>
            </legend>
            <div className="opt-list">
              {opts.sizes.map((s) => (
                <label key={s.id} className={`opt ${size === s.id ? 'is-checked' : ''}`}>
                  <input type="radio" name={`size-${dish.id}`} value={s.id} checked={size === s.id} onChange={() => setSize(s.id)} />
                  <span className="opt-mark opt-radio" aria-hidden="true" />
                  <span className="opt-label">{s.label}</span>
                  <span className="opt-price">{s.price ? `+${money(s.price)}` : 'Included'}</span>
                </label>
              ))}
            </div>
          </fieldset>
        )}

        {opts.extras.length > 0 && (
          <fieldset className="opt-group">
            <legend>
              <span>Extras</span>
              <span className="opt-optional">Optional</span>
            </legend>
            <div className="opt-list">
              {opts.extras.map((x) => (
                <label key={x.id} className={`opt ${extras.includes(x.id) ? 'is-checked' : ''}`}>
                  <input type="checkbox" checked={extras.includes(x.id)} onChange={() => toggleExtra(x.id)} />
                  <span className="opt-mark opt-check" aria-hidden="true">
                    <Icon name="check" size={14} strokeWidth={3} />
                  </span>
                  <span className="opt-label">{x.label}</span>
                  <span className="opt-price">{x.price ? `+${money(x.price)}` : 'Free'}</span>
                </label>
              ))}
            </div>
          </fieldset>
        )}

        <div className="field">
          <label htmlFor={notesId}>
            Special instructions <span className="muted">(optional)</span>
          </label>
          <textarea
            id={notesId}
            rows={2}
            maxLength={140}
            placeholder="E.g. no onions, sauce on the side"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onFocus={(e) => setTimeout(() => e.target.scrollIntoView({ block: 'center', behavior: 'smooth' }), 250)}
          />
          <span className="field-hint" aria-live="polite">
            {notes.length}/140
          </span>
        </div>
      </div>
    </Sheet>
  );
}
