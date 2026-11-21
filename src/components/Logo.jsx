import { useId } from 'react';

/** BITE wordmark: a tomato disc with a bite taken out of it. */
export default function Logo({ size = 28, wordmark = true, className = '' }) {
  const mask = `bite-${useId().replace(/:/g, '')}`;
  return (
    <span className={`logo ${className}`} aria-label="BITE" role="img">
      <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
        <defs>
          <mask id={mask}>
            <rect width="32" height="32" fill="#fff" />
            <circle cx="27" cy="6" r="6.5" fill="#000" />
            <circle cx="30.5" cy="13" r="3.6" fill="#000" />
          </mask>
        </defs>
        <circle cx="16" cy="16" r="14" fill="var(--accent)" mask={`url(#${mask})`} />
      </svg>
      {wordmark && (
        <span className="logo-word" aria-hidden="true" style={{ fontSize: size * 0.82 }}>
          BITE
        </span>
      )}
    </span>
  );
}
