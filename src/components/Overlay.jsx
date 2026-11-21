import { createContext, useContext, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { pushModal, popModal, trapFocus, prefersReducedMotion } from '../lib/modal.js';
import Icon from './Icon.jsx';

export const OverlayRootCtx = createContext(null);

/** Keeps an element mounted long enough to play its exit animation. */
function usePresence(open, ms = 240) {
  const [mounted, setMounted] = useState(open);
  const [closing, setClosing] = useState(false);
  useEffect(() => {
    if (open) {
      setMounted(true);
      setClosing(false);
      return undefined;
    }
    if (!mounted) return undefined;
    setClosing(true);
    const t = setTimeout(
      () => {
        setMounted(false);
        setClosing(false);
      },
      prefersReducedMotion() ? 0 : ms,
    );
    return () => clearTimeout(t);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps
  return { mounted, closing };
}

function useModalBehaviour(mounted, onClose, panelRef, initialFocusRef) {
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    if (!mounted) return undefined;
    const prev = document.activeElement;
    pushModal();
    const raf = requestAnimationFrame(() => {
      const target = initialFocusRef?.current || panelRef.current;
      target?.focus({ preventScroll: true });
    });
    return () => {
      cancelAnimationFrame(raf);
      popModal();
      if (prev && document.contains(prev)) prev.focus({ preventScroll: true });
    };
  }, [mounted]); // eslint-disable-line react-hooks/exhaustive-deps

  return (e) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      closeRef.current?.();
    }
    trapFocus(e, panelRef.current);
  };
}

/**
 * Bottom sheet with drag-to-dismiss on the grab handle, focus trap,
 * Escape to close and an optional sticky footer.
 */
export function Sheet({ open, onClose, title, hideTitle = false, children, footer, className = '', full = false, initialFocusRef, flush = false }) {
  const root = useContext(OverlayRootCtx);
  const { mounted, closing } = usePresence(open);
  const panelRef = useRef(null);
  const titleId = useId();
  const onKeyDown = useModalBehaviour(mounted, onClose, panelRef, initialFocusRef);
  const [drag, setDrag] = useState(0);
  const dragStart = useRef(null);

  if (!mounted || !root) return null;

  const onPointerDown = (e) => {
    dragStart.current = e.clientY;
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e) => {
    if (dragStart.current == null) return;
    setDrag(Math.max(0, e.clientY - dragStart.current));
  };
  const onPointerUp = () => {
    if (dragStart.current == null) return;
    dragStart.current = null;
    if (drag > 110) onClose();
    setDrag(0);
  };

  return createPortal(
    <div className={`overlay ${closing ? 'is-closing' : ''}`} onKeyDown={onKeyDown}>
      <div className="overlay-scrim" onClick={onClose} aria-hidden="true" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={hideTitle ? undefined : titleId}
        aria-label={hideTitle ? title : undefined}
        tabIndex={-1}
        className={`sheet ${full ? 'sheet-full' : ''} ${className}`}
        style={drag ? { transform: `translateY(${drag}px)`, transition: 'none' } : undefined}
      >
        <div
          className="sheet-grab"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          aria-hidden="true"
        >
          <span />
        </div>
        {!hideTitle && (
          <div className="sheet-head">
            <h2 id={titleId} className="sheet-title">
              {title}
            </h2>
            <button type="button" className="icon-btn icon-btn-plain" onClick={onClose} aria-label="Close">
              <Icon name="x" />
            </button>
          </div>
        )}
        <div className={`sheet-body ${flush ? 'is-flush' : ''}`}>{children}</div>
        {footer && <div className="sheet-footer">{footer}</div>}
      </div>
    </div>,
    root,
  );
}

/** Centered confirmation dialog (role=alertdialog). */
export function ConfirmDialog({ open, title, body, confirmLabel = 'Confirm', cancelLabel = 'Cancel', tone = 'accent', onConfirm, onClose }) {
  const root = useContext(OverlayRootCtx);
  const { mounted, closing } = usePresence(open, 180);
  const panelRef = useRef(null);
  const cancelRef = useRef(null);
  const titleId = useId();
  const bodyId = useId();
  const onKeyDown = useModalBehaviour(mounted, onClose, panelRef, cancelRef);
  if (!mounted || !root) return null;
  return createPortal(
    <div className={`overlay overlay-center ${closing ? 'is-closing' : ''}`} onKeyDown={onKeyDown}>
      <div className="overlay-scrim" onClick={onClose} aria-hidden="true" />
      <div ref={panelRef} role="alertdialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={bodyId} tabIndex={-1} className="dialog">
        <h2 id={titleId} className="dialog-title">
          {title}
        </h2>
        <p id={bodyId} className="dialog-body">
          {body}
        </p>
        <div className="dialog-actions">
          <button ref={cancelRef} type="button" className="btn btn-ghost" onClick={onClose}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`btn ${tone === 'dark' ? 'btn-dark' : 'btn-primary'}`}
            onClick={() => {
              onConfirm?.();
              onClose();
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    root,
  );
}
