import { useApp } from '../store/AppStore.jsx';
import { navigate } from '../lib/router.js';
import Icon from './Icon.jsx';

export default function Toast() {
  const { toast, hideToast } = useApp();
  return (
    <div className="toast-region" role="status" aria-live="polite" aria-atomic="true">
      {toast && (
        <div key={toast.id} className={`toast toast-${toast.tone}`}>
          {toast.tone === 'success' && (
            <span className="toast-icon" aria-hidden="true">
              <Icon name="check" size={14} strokeWidth={3} />
            </span>
          )}
          <span className="toast-msg">{toast.message}</span>
          {toast.action && (
            <button
              type="button"
              className="toast-action"
              onClick={() => {
                hideToast();
                if (toast.action.run) toast.action.run();
                if (toast.action.to) navigate(toast.action.to);
              }}
            >
              {toast.action.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
