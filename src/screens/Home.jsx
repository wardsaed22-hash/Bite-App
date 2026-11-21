import { useApp } from '../store/AppStore.jsx';
import { restaurants, categories, getRestaurant } from '../data/restaurants.js';
import { popularDishes } from '../data/dishes.js';
import { ORDER_STEPS } from '../data/orders.js';
import { linkProps, navigate } from '../lib/router.js';
import { greeting, foodImg, assetImg, restaurantImg, money, formatShort } from '../lib/format.js';
import { orderProgress, isActive, minutesLeft } from '../lib/orders.js';
import { useNow, itemsSummary } from '../lib/useNow.js';
import { Screen, SectionHead, CartBar } from '../components/ui.jsx';
import { RestaurantCard, DishTile } from '../components/Cards.jsx';
import { useAddresses } from '../components/AddressSheet.jsx';
import Img from '../components/Img.jsx';
import Icon from '../components/Icon.jsx';
import './Home.css';

const PROMOS = [
  { id: 'first', title: '20% off your next order', text: 'Use code BITE20 at checkout', cta: 'Order now', image: 'first-order', tone: 'ink', to: '/search' },
  {
    id: 'weekend',
    title: 'Free delivery all weekend',
    text: 'From Ember & Bun and Cluck Club',
    cta: 'Explore',
    image: 'weekend',
    tone: 'tomato',
    to: '/restaurant/ember-bun',
  },
  { id: 'sweet', title: 'Sweet tooth?', text: 'Desserts from $5 near you', cta: 'See desserts', image: 'sweet', tone: 'green', to: '/search?cat=desserts' },
];

function HomeHeader() {
  const { unreadCount, setAddressSheet } = useApp();
  const { current } = useAddresses();
  return (
    <header className="home-head">
      <button
        type="button"
        className="loc-btn"
        onClick={() => setAddressSheet(true)}
        aria-label={`Delivery address: ${current.label}, ${current.line1}. Change address`}
      >
        <span className="loc-icon" aria-hidden="true">
          <Icon name="pin" size={18} />
        </span>
        <span className="loc-text" aria-hidden="true">
          <span className="loc-label">Deliver to · {current.label}</span>
          <span className="loc-line">
            {current.line1}
            <Icon name="chevronDown" size={16} />
          </span>
        </span>
      </button>
      <a className="icon-btn" {...linkProps('/notifications')} aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}>
        <Icon name="bell" />
        {unreadCount > 0 && <span className="badge-dot" aria-hidden="true" />}
      </a>
    </header>
  );
}

function ActiveOrderCard({ order }) {
  const now = useNow(1000);
  const { step, progress } = orderProgress(order, now);
  const r = getRestaurant(order.restaurantId);
  const s = ORDER_STEPS[step];
  return (
    <a className="live-card" {...linkProps(`/tracking/${order.id}`)}>
      <span className="live-top">
        <span className="live-pulse" aria-hidden="true" />
        <span className="live-status">{s.label}</span>
        <span className="live-eta">{minutesLeft(order, now)} min</span>
      </span>
      <span className="live-name">
        {r.name} · {order.id}
      </span>
      <span className="live-bar" aria-hidden="true">
        <span style={{ width: `${Math.max(6, progress * 100)}%` }} />
      </span>
      <span className="live-cta">
        Track order <Icon name="arrowRight" size={16} />
      </span>
    </a>
  );
}

function RecentOrderCard({ order }) {
  const { reorder } = useApp();
  const r = getRestaurant(order.restaurantId);
  return (
    <div className="recent-card">
      <Img src={restaurantImg(r.image, true)} alt="" className="recent-thumb" width="560" height="340" />
      <div className="recent-text">
        <p className="recent-kicker">Order again · {formatShort(order.placedAt)}</p>
        <h3>{r.name}</h3>
        <p className="recent-items">{itemsSummary(order.items)}</p>
      </div>
      <button type="button" className="btn btn-xs btn-dark" onClick={() => reorder(order)} aria-label={`Reorder from ${r.name}, ${money(order.total)}`}>
        <Icon name="refresh" size={16} /> Reorder
      </button>
    </div>
  );
}

export default function Home() {
  const { prefs, orders } = useApp();
  const first = prefs.name.split(' ')[0];
  const active = orders.find((o) => isActive(o));
  const lastDelivered = orders.find((o) => o.status === 'delivered');
  const featured = restaurants.filter((r) => r.featured);
  const recommended = [...restaurants].filter((r) => !r.featured).sort((a, b) => b.rating - a.rating);

  return (
    <>
      <Screen header={<HomeHeader />} className="home" label="Home">
        <section className="home-hero pad">
          <p className="home-greet">
            {greeting()}, {first}
          </p>
          <h1>What are you craving?</h1>
          <a className="search-fake" {...linkProps('/search?focus=1')}>
            <Icon name="search" />
            <span>Search dishes, restaurants, cuisines</span>
            <span className="search-fake-filter" aria-hidden="true">
              <Icon name="sliders" size={18} />
            </span>
          </a>
        </section>

        <section aria-label="Categories">
          <ul className="h-scroll cats" role="list">
            {categories.map((c) => (
              <li key={c.id}>
                <a className="cat" {...linkProps(`/search?cat=${c.id}`)}>
                  <Img src={foodImg(c.image, true)} alt="" className="cat-img" width="240" height="240" />
                  <span>{c.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>

        {(active || lastDelivered) && (
          <section className="pad home-order" aria-label={active ? 'Active order' : 'Recent order'}>
            {active ? <ActiveOrderCard order={active} /> : <RecentOrderCard order={lastDelivered} />}
          </section>
        )}

        <section aria-label="Offers" className="section">
          <ul className="h-scroll promos" role="list">
            {PROMOS.map((p) => (
              <li key={p.id}>
                <a className={`promo promo-${p.tone}`} {...linkProps(p.to)}>
                  <span className="promo-text">
                    <b>{p.title}</b>
                    <span>{p.text}</span>
                    <span className="promo-cta">{p.cta}</span>
                  </span>
                  <Img src={assetImg('banners', p.image)} alt="" className="promo-img" width="800" height="440" />
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section className="section" aria-labelledby="h-popular">
          <SectionHead id="h-popular" title="Popular near you" action="See all" to="/search?sort=popular" />
          <ul className="h-scroll" role="list">
            {featured.map((r, n) => (
              <li key={r.id}>
                <RestaurantCard restaurant={r} eager={n < 2} />
              </li>
            ))}
          </ul>
        </section>

        <section className="section" aria-labelledby="h-dishes">
          <SectionHead id="h-dishes" title="Popular dishes" action="More" to="/search?sort=dishes" />
          <ul className="h-scroll" role="list">
            {popularDishes.slice(0, 10).map((d) => (
              <li key={d.id}>
                <DishTile dish={d} />
              </li>
            ))}
          </ul>
        </section>

        <section className="section" aria-labelledby="h-rec">
          <SectionHead id="h-rec" title="Recommended for you" />
          <ul className="rec-list pad" role="list">
            {recommended.map((r) => (
              <li key={r.id}>
                <RestaurantCard restaurant={r} variant="wide" />
              </li>
            ))}
          </ul>
        </section>

        <p className="home-foot">
          You’ve reached the end —{' '}
          <button type="button" className="text-link" onClick={() => navigate('/search')}>
            search everything
          </button>
        </p>
        <div className="bottom-space-lg" />
      </Screen>
      <CartBar />
    </>
  );
}
