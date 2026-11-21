import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { useApp } from '../store/AppStore.jsx';
import { restaurants, categories, getRestaurant } from '../data/restaurants.js';
import { dishes } from '../data/dishes.js';
import { popularSearches } from '../data/user.js';
import { linkProps } from '../lib/router.js';
import { foodImg, restaurantImg, etaText, feeText, priceLevel, plural } from '../lib/format.js';
import { Screen, Rating, Segmented, EmptyState } from '../components/ui.jsx';
import { DishRow } from '../components/Cards.jsx';
import { Sheet } from '../components/Overlay.jsx';
import Img from '../components/Img.jsx';
import Icon from '../components/Icon.jsx';
import './Search.css';

const EMPTY_FILTERS = { cats: [], rating: 0, time: 0, price: [], sort: 'relevance' };
const RATINGS = [
  { id: 0, label: 'Any' },
  { id: 4.5, label: '4.5+' },
  { id: 4.7, label: '4.7+' },
];
const TIMES = [
  { id: 0, label: 'Any' },
  { id: 20, label: 'Under 20 min' },
  { id: 30, label: 'Under 30 min' },
  { id: 45, label: 'Under 45 min' },
];
const SORTS = [
  { id: 'relevance', label: 'Recommended' },
  { id: 'rating', label: 'Top rated' },
  { id: 'time', label: 'Fastest delivery' },
  { id: 'distance', label: 'Nearest' },
];

const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const catLabel = Object.fromEntries(categories.map((c) => [c.id, c.label]));

const rText = (r) => norm([r.name, ...r.cuisines, ...r.categories.map((c) => catLabel[c])].join(' '));
const dText = (d) => norm([d.name, d.description, d.menu, ...d.tags.map((t) => catLabel[t] || t)].join(' '));

function activeCount(f) {
  return f.cats.length + (f.rating ? 1 : 0) + (f.time ? 1 : 0) + f.price.length + (f.sort !== 'relevance' ? 1 : 0);
}

function restaurantPasses(r, f) {
  if (f.cats.length && !r.categories.some((c) => f.cats.includes(c))) return false;
  if (f.rating && r.rating < f.rating) return false;
  if (f.time && r.eta[1] > f.time) return false;
  if (f.price.length && !f.price.includes(r.priceLevel)) return false;
  return true;
}

function dishPasses(d, f) {
  const r = getRestaurant(d.restaurantId);
  if (f.cats.length) {
    const cats = d.tags.length ? d.tags : r.categories;
    if (!cats.some((c) => f.cats.includes(c))) return false;
  }
  return restaurantPasses({ ...r, categories: f.cats.length ? f.cats : r.categories }, f);
}

const sorters = {
  relevance: () => 0,
  rating: (a, b) => b.rating - a.rating,
  time: (a, b) => a.eta[0] - b.eta[0],
  distance: (a, b) => a.distance - b.distance,
};

function RestaurantRow({ r }) {
  return (
    <li className="rrow">
      <Img src={restaurantImg(r.image, true)} alt="" className="rrow-img" width="560" height="340" />
      <div className="rrow-text">
        <h3>
          <a className="stretched" {...linkProps(`/restaurant/${r.id}`)}>
            {r.name}
          </a>
        </h3>
        <p className="rrow-sub">
          {r.cuisines.join(' · ')} · {priceLevel(r.priceLevel)}
        </p>
        <p className="rrow-meta">
          <Rating value={r.rating} compact />
          <span>{etaText(r.eta)}</span>
          <span className={r.deliveryFee === 0 ? 'is-free-text' : ''}>{feeText(r.deliveryFee)}</span>
        </p>
      </div>
    </li>
  );
}

export default function Search({ query }) {
  const { recentSearches, addRecentSearch, removeRecentSearch, clearRecentSearches } = useApp();
  const [q, setQ] = useState(query.q || '');
  const [filters, setFilters] = useState(() => ({
    ...EMPTY_FILTERS,
    cats: query.cat ? [query.cat] : [],
    sort: query.sort === 'popular' ? 'rating' : 'relevance',
  }));
  const [tab, setTab] = useState(query.sort === 'dishes' ? 'dishes' : 'all');
  const [sheet, setSheet] = useState(false);
  const [draft, setDraft] = useState(filters);
  const inputRef = useRef(null);
  const inputId = useId();

  useEffect(() => {
    if (query.focus) inputRef.current?.focus({ preventScroll: true });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const nFilters = activeCount(filters);
  const browsing = !q.trim() && !nFilters && !query.sort;

  const results = useMemo(() => {
    const tokens = norm(q.trim()).split(/\s+/).filter(Boolean);
    const match = (text) => tokens.every((t) => text.includes(t));
    let ds = dishes.filter((d) => match(dText(d)) && dishPasses(d, filters));
    // A restaurant matches on its own name/cuisine, or when it serves a matching dish.
    const servesMatch = new Set(tokens.length ? ds.map((d) => d.restaurantId) : []);
    let rs = restaurants.filter((r) => (match(rText(r)) || servesMatch.has(r.id)) && restaurantPasses(r, filters));
    const sort = sorters[filters.sort];
    rs = [...rs].sort(sort);
    if (filters.sort !== 'relevance') ds = [...ds].sort((a, b) => sort(getRestaurant(a.restaurantId), getRestaurant(b.restaurantId)));
    else ds = [...ds].sort((a, b) => Number(b.popular) - Number(a.popular));
    return { rs, ds };
  }, [q, filters]);

  const submit = (e) => {
    e.preventDefault();
    addRecentSearch(q);
    inputRef.current?.blur();
  };

  const runSearch = (term) => {
    setQ(term);
    addRecentSearch(term);
  };

  const toggleCat = (id) => setFilters((f) => ({ ...f, cats: f.cats.includes(id) ? f.cats.filter((c) => c !== id) : [...f.cats, id] }));

  const openFilters = () => {
    setDraft(filters);
    setSheet(true);
  };

  const total = results.rs.length + results.ds.length;
  const showR = tab !== 'dishes' && results.rs.length > 0;
  const showD = tab !== 'restaurants' && results.ds.length > 0;

  const header = (
    <header className="search-head">
      <form role="search" className="search-form" onSubmit={submit}>
        <label htmlFor={inputId} className="sr-only">
          Search restaurants, dishes or categories
        </label>
        <span className="search-input">
          <Icon name="search" />
          <input
            ref={inputRef}
            id={inputId}
            type="search"
            enterKeyHint="search"
            autoComplete="off"
            placeholder="Dishes, restaurants, cuisines"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          {q && (
            <button
              type="button"
              className="search-clear"
              onClick={() => {
                setQ('');
                inputRef.current?.focus();
              }}
              aria-label="Clear search"
            >
              <Icon name="x" size={16} />
            </button>
          )}
        </span>
        <button
          type="button"
          className={`icon-btn filter-btn ${nFilters ? 'has-filters' : ''}`}
          onClick={openFilters}
          aria-label={`Filters${nFilters ? `, ${nFilters} active` : ''}`}
        >
          <Icon name="sliders" />
          {nFilters > 0 && (
            <span className="filter-count" aria-hidden="true">
              {nFilters}
            </span>
          )}
        </button>
      </form>
      <ul className="h-scroll quick-cats" role="list" aria-label="Quick category filters">
        {categories.map((c) => (
          <li key={c.id}>
            <button type="button" className="chip" aria-pressed={filters.cats.includes(c.id)} onClick={() => toggleCat(c.id)}>
              {c.label}
            </button>
          </li>
        ))}
      </ul>
    </header>
  );

  return (
    <Screen header={header} className="search" label="Search">
      {browsing ? (
        <div className="search-browse">
          {recentSearches.length > 0 && (
            <section className="pad" aria-labelledby="recent-h">
              <div className="sub-head">
                <h2 id="recent-h">Recent searches</h2>
                <button type="button" className="link-btn" onClick={clearRecentSearches}>
                  Clear all
                </button>
              </div>
              <ul className="recent-list" role="list">
                {recentSearches.map((s) => (
                  <li key={s}>
                    <button type="button" className="recent-item" onClick={() => runSearch(s)}>
                      <Icon name="history" size={18} />
                      <span>{s}</span>
                    </button>
                    <button
                      type="button"
                      className="icon-btn icon-btn-plain"
                      onClick={() => removeRecentSearch(s)}
                      aria-label={`Remove “${s}” from recent searches`}
                    >
                      <Icon name="x" size={16} />
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="pad gap-top" aria-labelledby="pop-h">
            <div className="sub-head">
              <h2 id="pop-h">Popular searches</h2>
            </div>
            <ul className="chips" role="list">
              {popularSearches.map((s) => (
                <li key={s}>
                  <button type="button" className="chip" onClick={() => runSearch(s)}>
                    <Icon name="trending" size={14} /> {s}
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <section className="pad gap-top" aria-labelledby="cat-h">
            <div className="sub-head">
              <h2 id="cat-h">Browse by category</h2>
            </div>
            <ul className="cat-grid" role="list">
              {categories.map((c) => (
                <li key={c.id}>
                  <button type="button" className="cat-tile" onClick={() => toggleCat(c.id)}>
                    <Img src={foodImg(c.image, true)} alt="" width="240" height="240" />
                    <span>{c.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
          <div className="bottom-space" />
        </div>
      ) : (
        <div className="search-results">
          {nFilters > 0 && (
            <div className="active-filters pad">
              <span className="muted">Filters:</span>
              {filters.cats.map((c) => (
                <button key={c} type="button" className="chip chip-sm is-active" onClick={() => toggleCat(c)} aria-label={`Remove filter ${catLabel[c]}`}>
                  {catLabel[c]} <Icon name="x" size={14} />
                </button>
              ))}
              {filters.rating > 0 && (
                <button
                  type="button"
                  className="chip chip-sm is-active"
                  onClick={() => setFilters((f) => ({ ...f, rating: 0 }))}
                  aria-label="Remove rating filter"
                >
                  ★ {filters.rating}+ <Icon name="x" size={14} />
                </button>
              )}
              {filters.time > 0 && (
                <button
                  type="button"
                  className="chip chip-sm is-active"
                  onClick={() => setFilters((f) => ({ ...f, time: 0 }))}
                  aria-label="Remove delivery time filter"
                >
                  &lt; {filters.time} min <Icon name="x" size={14} />
                </button>
              )}
              {filters.price.map((p) => (
                <button
                  key={p}
                  type="button"
                  className="chip chip-sm is-active"
                  onClick={() => setFilters((f) => ({ ...f, price: f.price.filter((x) => x !== p) }))}
                  aria-label={`Remove price filter ${priceLevel(p)}`}
                >
                  {priceLevel(p)} <Icon name="x" size={14} />
                </button>
              ))}
              {filters.sort !== 'relevance' && (
                <button
                  type="button"
                  className="chip chip-sm is-active"
                  onClick={() => setFilters((f) => ({ ...f, sort: 'relevance' }))}
                  aria-label="Reset sort order"
                >
                  {SORTS.find((s) => s.id === filters.sort).label} <Icon name="x" size={14} />
                </button>
              )}
              <button type="button" className="link-btn" onClick={() => setFilters(EMPTY_FILTERS)}>
                Clear all
              </button>
            </div>
          )}

          <p className="sr-only" aria-live="polite">
            {total ? `${plural(results.rs.length, 'restaurant')} and ${plural(results.ds.length, 'dish', 'dishes')} found` : 'No results'}
          </p>

          {total > 0 ? (
            <>
              <div className="results-tabs">
                <Segmented
                  label="Result type"
                  value={tab}
                  onChange={setTab}
                  options={[
                    { id: 'all', label: 'All', count: total },
                    { id: 'restaurants', label: 'Restaurants', count: results.rs.length },
                    { id: 'dishes', label: 'Dishes', count: results.ds.length },
                  ]}
                />
              </div>
              <div onClickCapture={() => q.trim() && addRecentSearch(q)}>
                {showR && (
                  <section aria-labelledby="res-r">
                    <h2 id="res-r" className="results-h">
                      Restaurants <span className="muted">{results.rs.length}</span>
                    </h2>
                    <ul className="rrow-list" role="list">
                      {(tab === 'all' ? results.rs.slice(0, 4) : results.rs).map((r) => (
                        <RestaurantRow key={r.id} r={r} />
                      ))}
                    </ul>
                    {tab === 'all' && results.rs.length > 4 && (
                      <button type="button" className="link-btn pad" onClick={() => setTab('restaurants')}>
                        Show all {results.rs.length} restaurants
                      </button>
                    )}
                  </section>
                )}
                {showD && (
                  <section aria-labelledby="res-d">
                    <h2 id="res-d" className="results-h">
                      Dishes <span className="muted">{results.ds.length}</span>
                    </h2>
                    <div className="dish-list">
                      {results.ds.map((d) => (
                        <DishRow key={d.id} dish={d} showRestaurant />
                      ))}
                    </div>
                  </section>
                )}
                {!showR && !showD && <EmptyState icon="search" title={`No ${tab} match`} text="Try the other tabs or adjust your filters." />}
              </div>
            </>
          ) : (
            <EmptyState
              icon="search"
              title={q.trim() ? `No results for “${q.trim()}”` : 'No matches for these filters'}
              text="Check the spelling, try a broader term like “pizza”, or remove some filters."
              action={nFilters ? 'Clear filters' : 'Clear search'}
              onAction={() => (nFilters ? setFilters(EMPTY_FILTERS) : setQ(''))}
            />
          )}
          <div className="bottom-space" />
        </div>
      )}

      <Sheet
        open={sheet}
        onClose={() => setSheet(false)}
        title="Filters"
        footer={
          <div className="row-2">
            <button type="button" className="btn btn-ghost" onClick={() => setDraft(EMPTY_FILTERS)}>
              Reset
            </button>
            <button
              type="button"
              className="btn btn-dark"
              onClick={() => {
                setFilters(draft);
                setSheet(false);
              }}
            >
              Show results
            </button>
          </div>
        }
      >
        <fieldset className="filter-group">
          <legend>Sort by</legend>
          <div className="chips">
            {SORTS.map((s) => (
              <button key={s.id} type="button" className="chip" aria-pressed={draft.sort === s.id} onClick={() => setDraft((d) => ({ ...d, sort: s.id }))}>
                {s.label}
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset className="filter-group">
          <legend>Category</legend>
          <div className="chips">
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                className="chip"
                aria-pressed={draft.cats.includes(c.id)}
                onClick={() => setDraft((d) => ({ ...d, cats: d.cats.includes(c.id) ? d.cats.filter((x) => x !== c.id) : [...d.cats, c.id] }))}
              >
                {c.label}
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset className="filter-group">
          <legend>Rating</legend>
          <div className="chips">
            {RATINGS.map((r) => (
              <button key={r.id} type="button" className="chip" aria-pressed={draft.rating === r.id} onClick={() => setDraft((d) => ({ ...d, rating: r.id }))}>
                {r.id ? <>★ {r.label}</> : r.label}
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset className="filter-group">
          <legend>Delivery time</legend>
          <div className="chips">
            {TIMES.map((t) => (
              <button key={t.id} type="button" className="chip" aria-pressed={draft.time === t.id} onClick={() => setDraft((d) => ({ ...d, time: t.id }))}>
                {t.label}
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset className="filter-group">
          <legend>Price level</legend>
          <div className="chips">
            {[1, 2, 3].map((p) => (
              <button
                key={p}
                type="button"
                className="chip chip-price"
                aria-pressed={draft.price.includes(p)}
                aria-label={['Budget', 'Moderate', 'Premium'][p - 1]}
                onClick={() => setDraft((d) => ({ ...d, price: d.price.includes(p) ? d.price.filter((x) => x !== p) : [...d.price, p] }))}
              >
                {priceLevel(p)}
              </button>
            ))}
          </div>
        </fieldset>
      </Sheet>
    </Screen>
  );
}
