import { useRef, useState } from 'react';
import { useApp } from '../store/AppStore.jsx';
import { assetImg } from '../lib/format.js';
import Img from '../components/Img.jsx';
import Icon from '../components/Icon.jsx';
import Logo from '../components/Logo.jsx';
import './Onboarding.css';

const SLIDES = [
  {
    image: 'discover',
    title: 'Discover food near you',
    text: 'Hand-picked kitchens around the corner — from smash burgers to slow-simmered ramen.',
    chip: { icon: 'pin', text: '48 restaurants nearby' },
  },
  {
    image: 'order',
    title: 'Order in a few taps',
    text: 'Customise your dish, check out in seconds, reorder favourites with one tap.',
    chip: { icon: 'check', text: 'Added to cart', tone: 'success' },
  },
  {
    image: 'track',
    title: 'Track your order live',
    text: 'Follow every step, from the kitchen to your door, with real-time updates.',
    chip: { icon: 'bike', text: 'On the way · 12 min' },
  },
];

export default function Onboarding() {
  const { completeOnboarding } = useApp();
  const [i, setI] = useState(0);
  const startX = useRef(null);
  const last = i === SLIDES.length - 1;
  const s = SLIDES[i];

  const go = (n) => setI(Math.max(0, Math.min(SLIDES.length - 1, n)));
  const next = () => (last ? completeOnboarding() : go(i + 1));

  return (
    <div
      className="screen onb"
      onPointerDown={(e) => (startX.current = e.clientX)}
      onPointerUp={(e) => {
        if (startX.current == null) return;
        const dx = e.clientX - startX.current;
        startX.current = null;
        if (Math.abs(dx) > 50) go(i + (dx < 0 ? 1 : -1));
      }}
      onKeyDown={(e) => {
        if (e.target.tagName === 'BUTTON' && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) {
          go(i + (e.key === 'ArrowRight' ? 1 : -1));
        }
      }}
    >
      <header className="onb-top">
        <Logo size={26} />
        {!last && (
          <button type="button" className="btn btn-xs onb-skip" onClick={completeOnboarding}>
            Skip
          </button>
        )}
      </header>

      <main id="main" className="onb-main" tabIndex={-1} aria-roledescription="carousel" aria-label="Welcome to BITE">
        <div key={i} className="onb-slide" role="group" aria-roledescription="slide" aria-label={`${i + 1} of ${SLIDES.length}`}>
          <div className="onb-media">
            <Img src={assetImg('onboarding', s.image)} alt="" eager width="860" height="1080" />
            <span className={`onb-chip ${s.chip.tone === 'success' ? 'is-success' : ''}`} aria-hidden="true">
              <span className="onb-chip-icon">
                <Icon name={s.chip.icon} size={14} strokeWidth={2.5} />
              </span>
              {s.chip.text}
            </span>
          </div>
          <div className="onb-copy">
            <h1>{s.title}</h1>
            <p>{s.text}</p>
          </div>
        </div>
      </main>

      <footer className="onb-foot">
        <div className="onb-dots">
          {SLIDES.map((_, n) => (
            <button
              key={n}
              type="button"
              className={n === i ? 'is-active' : n < i ? 'is-done' : ''}
              onClick={() => go(n)}
              aria-label={`Go to step ${n + 1}`}
              aria-current={n === i ? 'step' : undefined}
            />
          ))}
        </div>
        <button type="button" className={`btn ${last ? 'btn-primary' : 'btn-dark'} onb-next`} onClick={next}>
          {last ? 'Get started' : 'Next'}
          <Icon name="arrowRight" size={18} />
        </button>
      </footer>
    </div>
  );
}
