import { lazy, Suspense, useEffect, useState } from 'react';
import { useApp } from './store/AppStore.jsx';
import { useRoute } from './lib/router.js';
import { OverlayRootCtx, ConfirmDialog } from './components/Overlay.jsx';
import BottomNav from './components/BottomNav.jsx';
import Toast from './components/Toast.jsx';
import DishSheet from './components/DishSheet.jsx';
import AddressSheet from './components/AddressSheet.jsx';
import Logo from './components/Logo.jsx';
import Home from './screens/Home.jsx';

// Route-level code splitting. Home ships in the main bundle; everything else
// is fetched on demand and prefetched when the browser is idle.
const loaders = {
  onboarding: () => import('./screens/Onboarding.jsx'),
  search: () => import('./screens/Search.jsx'),
  restaurant: () => import('./screens/Restaurant.jsx'),
  cart: () => import('./screens/Cart.jsx'),
  checkout: () => import('./screens/Checkout.jsx'),
  confirmation: () => import('./screens/Confirmation.jsx'),
  tracking: () => import('./screens/Tracking.jsx'),
  orders: () => import('./screens/Orders.jsx'),
  favorites: () => import('./screens/Favorites.jsx'),
  profile: () => import('./screens/Profile.jsx'),
  notifications: () => import('./screens/Notifications.jsx'),
};
const S = Object.fromEntries(Object.entries(loaders).map(([k, l]) => [k, lazy(l)]));

const TABS = { '': 'home', search: 'search', orders: 'orders', favorites: 'favorites', profile: 'profile' };
const WITH_FOOTER = new Set(['restaurant', 'cart', 'checkout', 'confirmation']);

function match(parts) {
  const [a = '', b] = parts;
  switch (a) {
    case '':
      return { name: 'home', C: Home };
    case 'restaurant':
    case 'confirmation':
    case 'tracking':
      return { name: a, C: S[a], props: { id: b } };
    default:
      return S[a] ? { name: a, C: S[a] } : { name: 'notfound', C: NotFound };
  }
}

function NotFound() {
  return (
    <div className="screen">
      <main id="main" className="screen-body center-col">
        <div className="empty">
          <h1 className="h2">Page not found</h1>
          <p>That screen doesn’t exist in this demo.</p>
          <a href="#/" className="btn btn-dark btn-sm">
            Back home
          </a>
        </div>
      </main>
    </div>
  );
}

function ScreenFallback() {
  return (
    <div className="screen-loading" aria-busy="true" aria-label="Loading">
      <span className="spinner" />
    </div>
  );
}

function Shell() {
  const route = useRoute();
  const { name, C, props } = match(route.parts);
  const tab = route.parts.length <= 1 ? TABS[route.parts[0] || ''] : undefined;
  const anim = tab ? 'anim-fade' : route.direction === 'back' ? 'anim-pop' : route.direction === 'forward' ? 'anim-push' : 'anim-fade';

  useEffect(() => {
    document.getElementById('device')?.setAttribute('data-layout', tab ? 'tabs' : WITH_FOOTER.has(name) ? 'footer' : 'none');
  }, [tab, name]);

  return (
    <>
      <div className="viewport">
        <div key={route.path} className={`screen-wrap ${anim}`}>
          <Suspense fallback={<ScreenFallback />}>
            <C {...props} query={route.query} />
          </Suspense>
        </div>
      </div>
      {tab && <BottomNav active={tab} />}
    </>
  );
}

function SideLeft() {
  return (
    <aside className="side side-left" aria-label="About this project">
      <Logo size={34} />
      <p className="side-tag">Good food, faster.</p>
      <p className="side-text">
        A mobile-first food ordering concept — onboarding, discovery, customisation, checkout and live tracking, designed for one-handed use.
      </p>
      <p className="side-meta">Portfolio concept · Demo data only · No real payments</p>
    </aside>
  );
}

function SideRight() {
  const { resetDemo } = useApp();
  return (
    <>
      <aside className="side side-right" aria-label="Demo tips">
        <h2>Try the flow</h2>
        <ol>
          <li>Pick a restaurant from Home</li>
          <li>Customise a dish and add it</li>
          <li>
            Apply code <b>BITE20</b> in the cart
          </li>
          <li>Place a demo order and track it live</li>
        </ol>
        <p className="side-text">Order tracking is accelerated — a full delivery takes about two minutes.</p>
        <button type="button" className="btn btn-ghost btn-sm" onClick={resetDemo}>
          Reset demo data
        </button>
      </aside>
    </>
  );
}

export default function App() {
  const { onboarded, confirm, setConfirm } = useApp();
  const [overlayRoot, setOverlayRoot] = useState(null);

  // Prefetch remaining screens once the first screen has settled.
  useEffect(() => {
    const idle = window.requestIdleCallback || ((cb) => setTimeout(cb, 1200));
    const h = idle(() => Object.values(loaders).forEach((l) => l().catch(() => {})));
    return () => (window.cancelIdleCallback ? window.cancelIdleCallback(h) : clearTimeout(h));
  }, []);

  return (
    <OverlayRootCtx.Provider value={overlayRoot}>
      <div className="stage">
        <SideLeft />
        <div className="device" id="device" data-layout="none">
          <a
            href="#main"
            className="skip-link"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('main')?.focus();
            }}
          >
            Skip to content
          </a>
          <div id="app-main" className="app-main">
            {onboarded ? (
              <Shell />
            ) : (
              <Suspense fallback={<ScreenFallback />}>
                <S.onboarding />
              </Suspense>
            )}
          </div>
          <div ref={setOverlayRoot} className="overlay-root" />
          <Toast />
        </div>
        <SideRight />
      </div>
      <DishSheet />
      <AddressSheet />
      <ConfirmDialog open={!!confirm} {...(confirm || {})} onClose={() => setConfirm(null)} />
    </OverlayRootCtx.Provider>
  );
}
