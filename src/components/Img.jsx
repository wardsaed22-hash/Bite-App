import { useState } from 'react';

/** Lazy, async-decoded image with a warm placeholder and soft fade-in. */
export default function Img({ src, alt = '', className = '', eager = false, width, height, ...rest }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <span className={`img ${loaded ? 'is-loaded' : ''} ${className}`}>
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        fetchpriority={eager ? 'high' : undefined}
        onLoad={() => setLoaded(true)}
        onError={() => setLoaded(true)}
        {...rest}
      />
    </span>
  );
}
