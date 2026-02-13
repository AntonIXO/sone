import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { Check, X, AlertCircle } from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────

interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

interface ToastContextType {
  showToast: (message: string, type?: "success" | "error" | "info") => void;
}

// ─── Context ───────────────────────────────────────────────────

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

// ─── Provider ──────────────────────────────────────────────────

const TOAST_DURATION = 3000;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback(
    (message: string, type: "success" | "error" | "info" = "success") => {
      const id = Math.random().toString(36).slice(2, 10);
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, TOAST_DURATION);
    },
    []
  );

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Toaster toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

// ─── Toaster (renders the stack of toasts) ─────────────────────

function Toaster({
  toasts,
  onDismiss,
}: {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-[104px] left-1/2 -translate-x-1/2 z-[99999] flex flex-col-reverse items-center gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto flex items-center gap-2.5 pl-3.5 pr-2.5 py-2.5 bg-[#1e1e1e] border border-[#2a2a2a] rounded-xl shadow-2xl max-w-[380px] min-w-[220px]"
          style={{ animation: "toastIn 0.25s ease-out" }}
        >
          {/* Icon */}
          <div className="shrink-0">
            {toast.type === "success" && (
              <div className="w-5 h-5 rounded-full bg-[#00FFFF]/15 flex items-center justify-center">
                <Check size={12} className="text-[#00FFFF]" strokeWidth={3} />
              </div>
            )}
            {toast.type === "error" && (
              <div className="w-5 h-5 rounded-full bg-[#ff4444]/15 flex items-center justify-center">
                <AlertCircle size={12} className="text-[#ff6666]" strokeWidth={3} />
              </div>
            )}
            {toast.type === "info" && (
              <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center">
                <Check size={12} className="text-white" strokeWidth={3} />
              </div>
            )}
          </div>

          {/* Message */}
          <span className="text-[13px] text-[#e0e0e0] font-medium flex-1 leading-snug">
            {toast.message}
          </span>

          {/* Dismiss */}
          <button
            onClick={() => onDismiss(toast.id)}
            className="shrink-0 p-0.5 text-[#666] hover:text-white transition-colors rounded"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
