import { useMemo, useRef, useState } from 'react';
import { useApp } from '../store/AppStore.jsx';
import { getRestaurant } from '../data/restaurants.js';
import { dishesFor, MENU_SECTIONS } from '../data/dishes.js';
import { goBack } from '../lib/router.js';
import { restaurantImg, etaText, feeText, priceLevel, formatCount, money } from '../lib/format.js';
import { Screen, FavButton, RestaurantAvatar, CartBar, EmptyState } from '../components/ui.jsx';
import { DishRow } from '../components/Cards.jsx';
import Img from '../components/Img.jsx';
import Icon, { Star } from '../components/Icon.jsx';
import './Restaurant.css';

const slug = (s) => s.toLowerCase().replace(/[^a-z]+/g, '-');

export default function Restaurant({ id }) {
  const r = getRestaurant(id);
  const { showToast, totals, cart } = useApp();
  const bodyRef = useRef(null);
  const tabsRef = useRef(null);
  const sectionRefs = useRef({});
  const [solid, setSolid] = useState(false);
  const [active, setActive] = useState('popular');
  const lockSpy = useRef(null);

  const sections = useMemo(() => {
    if (!r) return [];
    const all = dishesFor(r.id);
    const out = [{ id: 'popular', label: 'Popular', items: all.filter((d) => d.popular) }];
    MENU_SECTIONS.forEach((m) => {
      const items = all.filter((d) => d.menu === m);
      if (items.length) out.push({ id: slug(m), label: m, items });
    });
    return out.filter((s) => s.items.length);
  }, [r]);

  if (!r) {
    return (
      <Screen header={<div className="topbar" />}>
        <EmptyState icon="store" title="Restaurant not found" text="It may have been removed from this demo." action="Back home" to="/" />
      </Screen>
    );
  }

  const HEADER = 64;
  const TABS = 56;

  const centerTab = (sid) => {
    const el = tabsRef.current?.querySelector(`[data-tab="${sid}"]`);
    if (el && tabsRef.current) {
      const t = tabsRef.current;
      t.scrollTo({ left: el.offsetLeft - t.clientWidth / 2 + el.clientWidth / 2, behavior: 'smooth' });
    }
  };

  const onScroll = (e) => {
    const top = e.currentTarget.scrollTop;
    setSolid(top > 150);
    // After a tab tap, keep that tab active until the smooth scroll settles.
    if (lockSpy.current) {
      clearTimeout(lockSpy.current);
      lockSpy.current = setTimeout(() => (lockSpy.current = null), 160);
      return;
    }
    const el0 = e.currentTarget;
    const atBottom = top + el0.clientHeight >= el0.scrollHeight - 4;
    let current = sections[0]?.id;
    for (const s of sections) {
      const el = sectionRefs.current[s.id];
      if (el && el.offsetTop - HEADER - TABS - 8 <= top) current = s.id;
    }
    if (atBottom && top > 0) current = sections[sections.length - 1].id;
    if (current !== active) {
      setActive(current);
      centerTab(current);
    }
  };

  const jump = (sid) => {
    const el = sectionRefs.current[sid];
    if (!el || !bodyRef.current) return;
    setActive(sid);
    centerTab(sid);
    clearTimeout(lockSpy.current);
    // Released by onScroll once scrolling stops (or right away if no scroll happens).
    lockSpy.current = setTimeout(() => (lockSpy.current = null), 400);
    bodyRef.current.scrollTo({ top: el.offsetTop - HEADER - TABS + 1, behavior: 'smooth' });
  };

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: r.name, text: `${r.name} on BITE`, url });
      else {
        await navigator.clipboard.writeText(url);
        showToast('Link copied to clipboard', { tone: 'success' });
      }
    } catch {
      /* user cancelled */
    }
  };

  const hasCart = totals.count > 0 && cart.restaurantId === r.id;

  const bar = (
    <header className={`r-bar ${solid ? 'is-solid' : ''}`}>
      <button type="button" className="icon-btn icon-btn-float" onClick={() => goBack('/')} aria-label="Go back">
        <Icon name="back" />
      </button>
      <p className="r-bar-title" aria-hidden={!solid}>
        {r.name}
      </p>
      <div className="r-bar-actions">
        <button type="button" className="icon-btn icon-btn-float" onClick={share} aria-label={`Share ${r.name}`}>
          <Icon name="share" size={18} />
        </button>
        <FavButton kind="restaurants" id={r.id} name={r.name} className="icon-btn-float r-bar-fav" />
      </div>
    </header>
  );

  return (
    <>
      <Screen header={bar} className="restaurant" bodyRef={bodyRef} onScroll={onScroll} label={r.name}>
        <div className="r-cover">
          <Img src={restaurantImg(r.image)} alt={`${r.name} — signature food`} eager width="1080" height="640" />
        </div>

        <section className="r-info">
          <div className="r-id">
            <RestaurantAvatar restaurant={r} size={60} />
            <div className="r-id-text">
              <h1>{r.name}</h1>
              <p>{r.cuisines.join(' · ')}</p>
            </div>
          </div>
          <p className="r-blurb">{r.blurb}</p>
          <ul className="r-stats" role="list">
            <li>
              <span className="r-stat-top">
                <Star size={15} /> {r.rating.toFixed(1)}
              </span>
              <span className="r-stat-sub">{formatCount(r.reviews)} reviews</span>
            </li>
            <li>
              <span className="r-stat-top">{etaText(r.eta)}</span>
              <span className="r-stat-sub">Delivery</span>
            </li>
            <li>
              <span className={`r-stat-top ${r.deliveryFee === 0 ? 'is-free-text' : ''}`}>{r.deliveryFee === 0 ? 'Free' : money(r.deliveryFee)}</span>
              <span className="r-stat-sub">Delivery fee</span>
            </li>
            <li>
              <span className="r-stat-top">{priceLevel(r.priceLevel)}</span>
              <span className="r-stat-sub">{r.distance} km</span>
            </li>
          </ul>
          <div className="r-tags">
            {r.cuisines.map((c) => (
              <span key={c} className="badge badge-neutral">
                {c}
              </span>
            ))}
            {r.promo && (
              <span className="badge badge-hot">
                <Icon name="tag" size={12} /> {r.promo}
              </span>
            )}
            <span className="badge badge-green">Open until {r.openUntil}</span>
          </div>
        </section>

        <nav className="menu-tabs" aria-label="Menu categories">
          <ul ref={tabsRef} className="menu-tabs-scroll" role="list">
            {sections.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  data-tab={s.id}
                  className={`menu-tab ${active === s.id ? 'is-active' : ''}`}
                  aria-current={active === s.id ? 'true' : undefined}
                  onClick={() => jump(s.id)}
                >
                  {s.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {sections.map((s) => (
          <section key={s.id} ref={(el) => (sectionRefs.current[s.id] = el)} className="menu-section" aria-labelledby={`menu-${s.id}`}>
            <h2 id={`menu-${s.id}`} className="menu-h">
              {s.label}
              <span className="muted">{s.items.length}</span>
            </h2>
            <div className="dish-list">
              {s.items.map((d) => (
                <DishRow key={`${s.id}-${d.id}`} dish={d} />
              ))}
            </div>
          </section>
        ))}
        <p className="menu-note">
          <Icon name="info" size={14} /> Prices and menu are fictional demo content.
        </p>
        <div className={hasCart ? 'bottom-space-lg' : 'bottom-space'} />
      </Screen>
      <CartBar restaurantId={r.id} />
    </>
  );
}
