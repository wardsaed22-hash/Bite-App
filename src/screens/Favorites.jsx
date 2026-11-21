import { useState } from 'react';
import { useApp } from '../store/AppStore.jsx';
import { getRestaurant } from '../data/restaurants.js';
import { getDish } from '../data/dishes.js';
import { defaultSize } from '../lib/pricing.js';
import { money, foodImg } from '../lib/format.js';
import { Screen, Segmented, EmptyState, FavButton } from '../components/ui.jsx';
import { RestaurantCard } from '../components/Cards.jsx';
import Img from '../components/Img.jsx';
import Icon from '../components/Icon.jsx';
import './Favorites.css';

export default function Favorites() {
  const { favorites, openDish, addToCart } = useApp();
  const [tab, setTab] = useState('restaurants');
  const rs = favorites.restaurants.map(getRestaurant).filter(Boolean);
  const ds = favorites.dishes.map(getDish).filter(Boolean);

  return (
    <Screen
      label="Favorites"
      header={
        <header className="page-head">
          <h1>Favorites</h1>
        </header>
      }
    >
      <Segmented
        label="Favorite type"
        value={tab}
        onChange={setTab}
        options={[
          { id: 'restaurants', label: 'Restaurants', count: rs.length },
          { id: 'dishes', label: 'Dishes', count: ds.length },
        ]}
      />
      <div className="fav-list pad" role="tabpanel" aria-label={tab === 'restaurants' ? 'Favorite restaurants' : 'Favorite dishes'}>
        {tab === 'restaurants' ? (
          rs.length ? (
            <ul role="list" className="fav-r">
              {rs.map((r) => (
                <li key={r.id}>
                  <RestaurantCard restaurant={r} variant="wide" />
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              icon="heart"
              title="No favorite restaurants yet"
              text="Tap the heart on any restaurant to save it here for quick access."
              action="Explore restaurants"
              to="/"
            />
          )
        ) : ds.length ? (
          <ul role="list" className="fav-d">
            {ds.map((d) => {
              const r = getRestaurant(d.restaurantId);
              return (
                <li key={d.id} className="fav-dish">
                  <Img src={foodImg(d.image, true)} alt="" className="fav-dish-img" width="240" height="240" />
                  <div className="fav-dish-text">
                    <h3>
                      <button type="button" className="stretched" onClick={() => openDish(d.id)}>
                        {d.name}
                      </button>
                    </h3>
                    <p>{r.name}</p>
                    <p className="fav-dish-price">{money(d.price)}</p>
                  </div>
                  <div className="fav-dish-actions">
                    <FavButton kind="dishes" id={d.id} name={d.name} size={18} />
                    <button
                      type="button"
                      className="btn btn-xs btn-dark"
                      onClick={() => addToCart({ dishId: d.id, qty: 1, size: defaultSize(d), extras: [], notes: '' })}
                      aria-label={`Add ${d.name} to cart`}
                    >
                      <Icon name="plus" size={14} strokeWidth={2.5} /> Add
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <EmptyState
            icon="heart"
            title="No favorite dishes yet"
            text="Save dishes you love and add them to your cart in one tap."
            action="Find dishes"
            to="/search?sort=dishes"
          />
        )}
      </div>
      <div className="bottom-space" />
    </Screen>
  );
}
