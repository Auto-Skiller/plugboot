"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";

// ============================================================================
// TOAST TYPES
// ============================================================================

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
    id: string;
    type: ToastType;
    title: string;
    description?: string;
    duration?: number;
}

interface ToastContextValue {
    toasts: Toast[];
    addToast: (toast: Omit<Toast, "id">) => void;
    removeToast: (id: string) => void;
    success: (title: string, description?: string) => void;
    error: (title: string, description?: string) => void;
    warning: (title: string, description?: string) => void;
    info: (title: string, description?: string) => void;
}

// ============================================================================
// TOAST CONTEXT
// ============================================================================

const ToastContext = React.createContext<ToastContextValue | undefined>(undefined);

export function useToast() {
    const context = React.useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return context;
}

// ============================================================================
// TOAST PROVIDER
// ============================================================================

interface ToastProviderProps {
    children: React.ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
    const [toasts, setToasts] = React.useState<Toast[]>([]);

    const addToast = React.useCallback((toast: Omit<Toast, "id">) => {
        const id = Math.random().toString(36).substring(2, 9);
        const newToast: Toast = { ...toast, id };

        setToasts((prev) => [...prev, newToast]);

        // Auto-remove after duration
        const duration = toast.duration ?? 5000;
        if (duration > 0) {
            setTimeout(() => {
                setToasts((prev) => prev.filter((t) => t.id !== id));
            }, duration);
        }
    }, []);

    const removeToast = React.useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const success = React.useCallback(
        (title: string, description?: string) => {
            addToast({ type: "success", title, description });
        },
        [addToast]
    );

    const error = React.useCallback(
        (title: string, description?: string) => {
            addToast({ type: "error", title, description });
        },
        [addToast]
    );

    const warning = React.useCallback(
        (title: string, description?: string) => {
            addToast({ type: "warning", title, description });
        },
        [addToast]
    );

    const info = React.useCallback(
        (title: string, description?: string) => {
            addToast({ type: "info", title, description });
        },
        [addToast]
    );

    return (
        <ToastContext.Provider
            value={{ toasts, addToast, removeToast, success, error, warning, info }}
        >
            {children}
            <ToastContainer toasts={toasts} onRemove={removeToast} />
        </ToastContext.Provider>
    );
}

// ============================================================================
// TOAST CONTAINER
// ============================================================================

interface ToastContainerProps {
    toasts: Toast[];
    onRemove: (id: string) => void;
}

function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
    return (
        <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
            {toasts.map((toast) => (
                <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
            ))}
        </div>
    );
}

// ============================================================================
// TOAST ITEM
// ============================================================================

interface ToastItemProps {
    toast: Toast;
    onRemove: (id: string) => void;
}

const toastStyles: Record<ToastType, { bg: string; icon: React.ReactNode; iconColor: string }> = {
    success: {
        bg: "bg-green-50 dark:bg-green-950/50 border-green-200 dark:border-green-800",
        icon: <CheckCircle className="h-5 w-5" />,
        iconColor: "text-green-600 dark:text-green-400",
    },
    error: {
        bg: "bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-800",
        icon: <AlertCircle className="h-5 w-5" />,
        iconColor: "text-red-600 dark:text-red-400",
    },
    warning: {
        bg: "bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800",
        icon: <AlertTriangle className="h-5 w-5" />,
        iconColor: "text-amber-600 dark:text-amber-400",
    },
    info: {
        bg: "bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800",
        icon: <Info className="h-5 w-5" />,
        iconColor: "text-blue-600 dark:text-blue-400",
    },
};

function ToastItem({ toast, onRemove }: ToastItemProps) {
    const [isExiting, setIsExiting] = React.useState(false);
    const style = toastStyles[toast.type];

    const handleRemove = () => {
        setIsExiting(true);
        setTimeout(() => onRemove(toast.id), 200);
    };

    return (
        <div
            className={cn(
                "pointer-events-auto flex items-start gap-3 min-w-[320px] max-w-[420px] p-4 rounded-lg border shadow-lg",
                "transition-all duration-200",
                isExiting
                    ? "opacity-0 translate-x-4"
                    : "opacity-100 translate-x-0 animate-in slide-in-from-right-5",
                style.bg
            )}
        >
            {/* Icon */}
            <div className={cn("shrink-0 mt-0.5", style.iconColor)}>{style.icon}</div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">{toast.title}</p>
                {toast.description && (
                    <p className="text-sm text-muted-foreground mt-0.5">{toast.description}</p>
                )}
            </div>

            {/* Close Button */}
            <button
                onClick={handleRemove}
                className="shrink-0 p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            >
                <X className="h-4 w-4 text-muted-foreground" />
            </button>
        </div>
    );
}

// ============================================================================
// STANDALONE TOAST FUNCTION (for non-React contexts)
// ============================================================================

let toastHandler: ToastContextValue | null = null;

export function setToastHandler(handler: ToastContextValue) {
    toastHandler = handler;
}

export const toast = {
    success: (title: string, description?: string) => toastHandler?.success(title, description),
    error: (title: string, description?: string) => toastHandler?.error(title, description),
    warning: (title: string, description?: string) => toastHandler?.warning(title, description),
    info: (title: string, description?: string) => toastHandler?.info(title, description),
};
