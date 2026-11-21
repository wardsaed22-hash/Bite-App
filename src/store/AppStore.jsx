import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { usePersisted, clearPersisted } from '../lib/usePersisted.js';
import { getDish } from '../data/dishes.js';
import { getRestaurant } from '../data/restaurants.js';
import { pastOrders, ORDER_STEPS, COURIERS } from '../data/orders.js';
import { notificationSeed } from '../data/notifications.js';
import { demoUser, recentSearchSeed } from '../data/user.js';
import { cartTotals, itemKey, snapshotLines, PROMO_CODES } from '../lib/pricing.js';
import { generateOrderId, orderProgress } from '../lib/orders.js';
import { navigate } from '../lib/router.js';

const AppCtx = createContext(null);
export const useApp = () => useContext(AppCtx);

const EMPTY_CART = { restaurantId: null, items: [], promo: null };

const seedNotifications = () => {
  const now = Date.now();
  return notificationSeed.map(({ ago, ...n }) => ({ ...n, at: now - ago * 60000 }));
};

export function AppProvider({ children }) {
  const [onboarded, setOnboarded] = usePersisted('bite.onboarded', false);
  const [cart, setCart] = usePersisted('bite.cart', EMPTY_CART);
  const [favorites, setFavorites] = usePersisted('bite.favorites', {
    restaurants: ['kumo', 'forno-nove'],
    dishes: ['tiramisu', 'spicy-miso-ramen', 'salmon-power-bowl'],
  });
  const [myOrders, setMyOrders] = usePersisted('bite.orders', []);
  const [notifications, setNotifications] = usePersisted('bite.notifications', seedNotifications);
  const [recentSearches, setRecentSearches] = usePersisted('bite.recentSearches', recentSearchSeed);
  const [prefs, setPrefs] = usePersisted('bite.prefs', {
    ...demoUser,
    addressId: 'home',
    language: 'en',
    payment: 'card',
    notify: { orders: true, offers: true, account: true },
  });

  // ---- Transient UI state --------------------------------------------------
  const [toast, setToast] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [dishSheet, setDishSheet] = useState(null);
  const [addressSheet, setAddressSheet] = useState(false);
  const toastTimer = useRef();

  const showToast = useCallback((message, opts = {}) => {
    clearTimeout(toastTimer.current);
    setToast({ id: Date.now(), message, tone: opts.tone || 'default', action: opts.action });
    toastTimer.current = setTimeout(() => setToast(null), opts.duration || 2800);
  }, []);
  const hideToast = useCallback(() => setToast(null), []);

  // ---- Notifications -------------------------------------------------------
  const pushNotification = useCallback(
    (n) =>
      setNotifications((list) =>
        [{ id: `n-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, at: Date.now(), read: false, ...n }, ...list].slice(0, 40),
      ),
    [setNotifications],
  );
  const markRead = useCallback((id) => setNotifications((l) => l.map((n) => (n.id === id ? { ...n, read: true } : n))), [setNotifications]);
  const markAllRead = useCallback(() => setNotifications((l) => l.map((n) => ({ ...n, read: true }))), [setNotifications]);
  const unreadCount = notifications.filter((n) => !n.read).length;

  // ---- Cart ----------------------------------------------------------------
  const totals = useMemo(() => cartTotals(cart), [cart]);

  const addToCart = useCallback(
    (item, { editKey, silent, onDone } = {}) => {
      const dish = getDish(item.dishId);
      if (!dish) return false;
      const key = itemKey(item);
      const apply = (base) => {
        let items;
        if (editKey) items = base.items.map((i) => (i.key === editKey ? { ...item, key } : i));
        else items = [...base.items, { ...item, key }];
        // merge duplicate configurations
        const merged = [];
        for (const it of items) {
          const found = merged.find((m) => m.key === it.key);
          if (found) found.qty = Math.min(99, found.qty + it.qty);
          else merged.push({ ...it });
        }
        return { ...base, restaurantId: dish.restaurantId, items: merged };
      };
      const done = () => {
        onDone?.();
        if (!silent)
          showToast(editKey ? 'Cart updated' : `Added ${item.qty} × ${dish.name}`, {
            tone: 'success',
            action: editKey ? null : { label: 'View cart', to: '/cart' },
          });
      };

      if (cart.items.length && cart.restaurantId !== dish.restaurantId) {
        const from = getRestaurant(cart.restaurantId);
        const to = getRestaurant(dish.restaurantId);
        setConfirm({
          title: 'Start a new cart?',
          body: `Your cart has items from ${from?.name}. Adding this dish will clear them and start a new cart from ${to?.name}.`,
          confirmLabel: 'Start new cart',
          onConfirm: () => {
            setCart(apply(EMPTY_CART));
            done();
          },
        });
        return false;
      }
      setCart((c) => apply(c));
      done();
      return true;
    },
    [cart.items.length, cart.restaurantId, setCart, showToast],
  );

  const setQty = useCallback(
    (key, qty) =>
      setCart((c) => {
        const items = qty <= 0 ? c.items.filter((i) => i.key !== key) : c.items.map((i) => (i.key === key ? { ...i, qty: Math.min(99, qty) } : i));
        return items.length ? { ...c, items } : EMPTY_CART;
      }),
    [setCart],
  );

  const removeItem = useCallback(
    (key) => {
      const removed = cart.items.find((i) => i.key === key);
      const before = cart;
      setQty(key, 0);
      if (removed) {
        showToast(`Removed ${getDish(removed.dishId)?.name}`, {
          action: { label: 'Undo', run: () => setCart(before) },
        });
      }
    },
    [cart, setQty, setCart, showToast],
  );

  const clearCart = useCallback(() => setCart(EMPTY_CART), [setCart]);

  const applyPromo = useCallback(
    (code) => {
      const c = code.trim().toUpperCase();
      if (!PROMO_CODES[c]) return false;
      setCart((x) => ({ ...x, promo: c }));
      return true;
    },
    [setCart],
  );
  const removePromo = useCallback(() => setCart((x) => ({ ...x, promo: null })), [setCart]);

  const reorder = useCallback(
    (order) => {
      const items = order.items
        .filter((i) => getDish(i.dishId))
        .map((i) => {
          const it = { dishId: i.dishId, qty: i.qty, size: i.size, extras: i.extras || [], notes: i.notes || '' };
          return { ...it, key: itemKey(it) };
        });
      const r = getRestaurant(order.restaurantId);
      const run = () => {
        setCart({ restaurantId: order.restaurantId, items, promo: null });
        showToast(`Added your ${r.name} order to the cart`, { tone: 'success' });
        navigate('/cart');
      };
      if (cart.items.length) {
        setConfirm({
          title: 'Replace your cart?',
          body: `Reordering from ${r.name} will replace the ${totals.count} item${totals.count === 1 ? '' : 's'} currently in your cart.`,
          confirmLabel: 'Replace cart',
          onConfirm: run,
        });
      } else run();
    },
    [cart.items.length, totals.count, setCart, showToast],
  );

  // ---- Favorites -----------------------------------------------------------
  const isFavorite = useCallback((kind, id) => favorites[kind].includes(id), [favorites]);
  const toggleFavorite = useCallback(
    (kind, id) => {
      const on = favorites[kind].includes(id);
      setFavorites((f) => ({ ...f, [kind]: on ? f[kind].filter((x) => x !== id) : [id, ...f[kind]] }));
      const name = kind === 'restaurants' ? getRestaurant(id)?.name : getDish(id)?.name;
      showToast(on ? `Removed ${name} from favorites` : `Saved ${name} to favorites`, {
        tone: on ? 'default' : 'success',
        action: on ? { label: 'Undo', run: () => setFavorites((f) => ({ ...f, [kind]: [id, ...f[kind].filter((x) => x !== id)] })) } : null,
      });
    },
    [favorites, setFavorites, showToast],
  );

  // ---- Orders --------------------------------------------------------------
  const orders = useMemo(() => [...myOrders, ...pastOrders].sort((a, b) => b.placedAt - a.placedAt), [myOrders]);
  const getOrder = useCallback((id) => orders.find((o) => o.id === id), [orders]);

  const placeOrder = useCallback(
    (details) => {
      const now = Date.now();
      const r = totals.restaurant;
      const order = {
        id: generateOrderId(),
        restaurantId: cart.restaurantId,
        placedAt: now,
        simStart: now,
        status: 'active',
        notifiedStep: 0,
        stepTimes: { 0: now },
        items: snapshotLines(totals.lines),
        subtotal: totals.subtotal,
        deliveryFee: totals.deliveryFee,
        discount: totals.discount,
        promo: cart.promo,
        total: totals.total,
        etaMinutes: r.eta[1],
        courier: COURIERS[Math.floor(Math.random() * COURIERS.length)],
        ...details,
      };
      setMyOrders((l) => [order, ...l]);
      setCart(EMPTY_CART);
      if (prefs.notify.orders)
        pushNotification({ type: 'order', title: `Order ${order.id} confirmed`, body: `${r.name} has received your order.`, link: `/tracking/${order.id}` });
      return order;
    },
    [cart, totals, prefs.notify.orders, setMyOrders, setCart, pushNotification],
  );

  /** Demo helper: jump the simulation to the next status. */
  const advanceOrder = useCallback(
    (id) =>
      setMyOrders((l) =>
        l.map((o) => {
          if (o.id !== id || o.status !== 'active') return o;
          const { step } = orderProgress(o);
          const next = ORDER_STEPS[Math.min(step + 1, ORDER_STEPS.length - 1)];
          return { ...o, simStart: Date.now() - next.at * 1000 };
        }),
      ),
    [setMyOrders],
  );

  // Background ticker: progresses active orders, raising notifications + toasts.
  const hasActive = myOrders.some((o) => o.status === 'active');
  const ordersRef = useRef(myOrders);
  ordersRef.current = myOrders;
  useEffect(() => {
    if (!hasActive) return undefined;
    const tick = () => {
      const now = Date.now();
      const updates = {};
      ordersRef.current.forEach((o) => {
        if (o.status !== 'active') return;
        const { step, done } = orderProgress(o, now);
        if (step > (o.notifiedStep ?? 0)) updates[o.id] = { step, done, order: o };
      });
      const ids = Object.keys(updates);
      if (!ids.length) return;
      // Mark as notified synchronously so a quick second tick can't double-fire.
      ordersRef.current = ordersRef.current.map((o) => (updates[o.id] ? { ...o, notifiedStep: updates[o.id].step } : o));
      setMyOrders((list) =>
        list.map((o) => {
          const u = updates[o.id];
          if (!u) return o;
          // Record when each newly reached step actually happened (for the timeline).
          const stepTimes = { ...(o.stepTimes || {}) };
          for (let i = (o.notifiedStep ?? 0) + 1; i <= u.step; i++) stepTimes[i] = stepTimes[i] || now;
          const next = { ...o, notifiedStep: u.step, stepTimes };
          return u.done ? { ...next, status: 'delivered', deliveredAt: now } : next;
        }),
      );
      ids.forEach((id) => {
        const { step, order } = updates[id];
        const s = ORDER_STEPS[step];
        const r = getRestaurant(order.restaurantId);
        const last = step === ORDER_STEPS.length - 1;
        const title = last ? `Delivered: ${r.name}` : `${s.label} · ${r.name}`;
        if (prefs.notify.orders) pushNotification({ type: 'order', title, body: s.detail, link: `/tracking/${order.id}` });
        showToast(last ? `Delivered — enjoy your meal!` : `${s.label}: ${s.detail.toLowerCase()}`, { tone: last ? 'success' : 'default' });
      });
    };
    tick();
    const t = setInterval(tick, 1500);
    return () => clearInterval(t);
  }, [hasActive, setMyOrders, pushNotification, showToast, prefs.notify.orders]);

  // ---- Search history ------------------------------------------------------
  const addRecentSearch = useCallback(
    (q) => {
      const v = q.trim();
      if (v.length < 2) return;
      setRecentSearches((l) => [v, ...l.filter((x) => x.toLowerCase() !== v.toLowerCase())].slice(0, 6));
    },
    [setRecentSearches],
  );
  const removeRecentSearch = useCallback((q) => setRecentSearches((l) => l.filter((x) => x !== q)), [setRecentSearches]);
  const clearRecentSearches = useCallback(() => setRecentSearches([]), [setRecentSearches]);

  // ---- Misc ----------------------------------------------------------------
  const completeOnboarding = useCallback(() => {
    setOnboarded(true);
    navigate('/', { replace: true });
  }, [setOnboarded]);

  const resetDemo = useCallback(() => {
    clearPersisted();
    window.location.hash = '#/';
    window.location.reload();
  }, []);

  const value = {
    onboarded,
    completeOnboarding,
    cart,
    totals,
    addToCart,
    setQty,
    removeItem,
    clearCart,
    applyPromo,
    removePromo,
    reorder,
    favorites,
    isFavorite,
    toggleFavorite,
    orders,
    getOrder,
    placeOrder,
    advanceOrder,
    notifications,
    unreadCount,
    markRead,
    markAllRead,
    recentSearches,
    addRecentSearch,
    removeRecentSearch,
    clearRecentSearches,
    prefs,
    setPrefs,
    toast,
    showToast,
    hideToast,
    confirm,
    setConfirm,
    dishSheet,
    openDish: (dishId, edit = null) => setDishSheet({ dishId, edit }),
    closeDish: () => setDishSheet(null),
    addressSheet,
    setAddressSheet,
    resetDemo,
  };

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}
