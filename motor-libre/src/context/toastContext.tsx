import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const TOAST_DURATION_MS = 3500;

const ICONS: Record<ToastType, string> = {
  success: "bi-check-circle-fill",
  error: "bi-exclamation-triangle-fill",
  info: "bi-info-circle-fill",
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = "info") => {
      const id = nextId.current++;
      setToasts((current) => [...current.slice(-3), { id, message, type }]);
      window.setTimeout(() => dismiss(id), TOAST_DURATION_MS);
    },
    [dismiss]
  );

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div className="toast-stack" role="status" aria-live="polite">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast-item toast-item--${toast.type}`}>
            <i className={`bi ${ICONS[toast.type]}`} aria-hidden="true" />
            <span>{toast.message}</span>
            <button
              type="button"
              className="toast-item__close"
              aria-label="Cerrar notificación"
              onClick={() => dismiss(toast.id)}
            >
              <i className="bi bi-x-lg" aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast debe utilizarse dentro de ToastProvider");
  }

  return context;
}
