// While any sheet/dialog is open, the app content behind it is made `inert`
// so keyboard and screen-reader users stay inside the overlay.
let open = 0;

function sync() {
  const main = document.getElementById('app-main');
  if (!main) return;
  if (open > 0) main.setAttribute('inert', '');
  else main.removeAttribute('inert');
}

export function pushModal() {
  open += 1;
  sync();
}

export function popModal() {
  open = Math.max(0, open - 1);
  sync();
}

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function trapFocus(e, container) {
  if (e.key !== 'Tab' || !container) return;
  const items = [...container.querySelectorAll(FOCUSABLE)].filter((el) => el.offsetParent !== null || el === document.activeElement);
  if (!items.length) return;
  const first = items[0];
  const last = items[items.length - 1];
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
}

export const prefersReducedMotion = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
