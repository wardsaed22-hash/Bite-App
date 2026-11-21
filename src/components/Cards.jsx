import { useApp } from '../store/AppStore.jsx';
import { getRestaurant } from '../data/restaurants.js';
import { linkProps } from '../lib/router.js';
import { defaultSize } from '../lib/pricing.js';
import { money, foodImg, restaurantImg, etaText, feeText, priceLevel, formatCount } from '../lib/format.js';
import Img from './Img.jsx';
import Icon from './Icon.jsx';
import { FavButton, Rating, DietBadges } from './ui.jsx';

export function RestaurantCard({ restaurant: r, variant = 'tile', eager = false }) {
  return (
    <article className={`r-card r-card-${variant}`}>
      <div className="r-card-media">
        <Img src={restaurantImg(r.image, true)} alt="" width="560" height="340" eager={eager} />
        {r.promo && <span className="badge badge-promo">{r.promo}</span>}
      </div>
      <div className="r-card-body">
        <div className="r-card-row">
          <h3 className="r-card-name">
            <a className="stretched" {...linkProps(`/restaurant/${r.id}`)}>
              {r.name}
            </a>
          </h3>
          <Rating value={r.rating} count={formatCount(r.reviews)} compact={variant === 'tile'} />
        </div>
        {variant === 'wide' && (
          <p className="r-card-cuisine">
            {r.cuisines.join(' · ')} · {priceLevel(r.priceLevel)}
          </p>
        )}
        <p className="r-card-meta">
          <span>
            <Icon name="clock" size={14} /> {etaText(r.eta)}
          </span>
          <span className={r.deliveryFee === 0 ? 'is-free' : ''}>
            <Icon name="bike" size={14} /> {feeText(r.deliveryFee)}
          </span>
          {variant === 'wide' && <span>{r.distance} km</span>}
        </p>
      </div>
      <FavButton kind="restaurants" id={r.id} name={r.name} className="r-card-fav" size={18} />
    </article>
  );
}

function useQuickAdd() {
  const { addToCart } = useApp();
  return (dish) => addToCart({ dishId: dish.id, qty: 1, size: defaultSize(dish), extras: [], notes: '' });
}

/** Square tile used in horizontal carousels. */
export function DishTile({ dish }) {
  const { openDish } = useApp();
  const quickAdd = useQuickAdd();
  const r = getRestaurant(dish.restaurantId);
  return (
    <article className="dish-tile">
      <div className="dish-tile-media">
        <Img src={foodImg(dish.image, true)} alt="" width="240" height="240" />
        <button type="button" className="add-btn" onClick={() => quickAdd(dish)} aria-label={`Add ${dish.name} to cart, ${money(dish.price)}`}>
          <Icon name="plus" size={18} strokeWidth={2.5} />
        </button>
      </div>
      <h3 className="dish-tile-name">
        <button type="button" className="stretched" onClick={() => openDish(dish.id)}>
          {dish.name}
        </button>
      </h3>
      <p className="dish-tile-sub">{r.name}</p>
      <p className="dish-tile-price">{money(dish.price)}</p>
    </article>
  );
}

/** Menu row: details left, thumbnail + quick-add right. */
export function DishRow({ dish, showRestaurant = false }) {
  const { openDish, cart } = useApp();
  const quickAdd = useQuickAdd();
  const inCart = cart.restaurantId === dish.restaurantId ? cart.items.filter((i) => i.dishId === dish.id).reduce((a, i) => a + i.qty, 0) : 0;
  return (
    <article className="dish-row">
      <div className="dish-row-text">
        <h3 className="dish-row-name">
          <button type="button" className="stretched" onClick={() => openDish(dish.id)}>
            {dish.name}
          </button>
        </h3>
        <div className="dish-row-badges">
          {dish.popular && <span className="badge badge-hot">Popular</span>}
          <DietBadges dietary={dish.dietary} />
        </div>
        {showRestaurant && <p className="dish-row-rest">{getRestaurant(dish.restaurantId).name}</p>}
        <p className="dish-row-desc">{dish.description}</p>
        <p className="dish-row-price">
          {money(dish.price)}
          {inCart > 0 && <span className="in-cart">{inCart} in cart</span>}
        </p>
      </div>
      <div className="dish-row-media">
        <Img src={foodImg(dish.image, true)} alt="" width="240" height="240" />
        <button type="button" className="add-btn" onClick={() => quickAdd(dish)} aria-label={`Add ${dish.name} to cart, ${money(dish.price)}`}>
          <Icon name="plus" size={18} strokeWidth={2.5} />
        </button>
      </div>
    </article>
  );
}
