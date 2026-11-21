"use client";

import { Toast as ToastPrimitive } from "@base-ui/react/toast";
import { type ReactNode, useCallback } from "react";

import {
  HugeiconsCircleCheckIcon,
  HugeiconsBadgeAlertIcon,
  HugeiconsXIcon,
} from "@/components/icons";
import { cn } from "@/lib/utils";

/**
 * Toasts (0007 §7, after Sonner): short confirmations away from the change,
 * like "Moved to Interview · Undo". Inline feedback is preferred (no-ai-slop:
 * no toasts for everything). At most 3 visible; 4 s, or 6 s with an action;
 * paused on hover, focus and hidden tab; swipe down or right to dismiss.
 */

const TIMEOUT = 4000;
const TIMEOUT_WITH_ACTION = 6000;

type ToastType = "info" | "success" | "danger";

type ToastData = {
  /** Label of the close button for screen readers, e.g. "Dismiss". */
  closeLabel: string;
};

type ToastProviderProps = { children: ReactNode };

/** Wrap the app once. */
export function ToastProvider({ children }: ToastProviderProps) {
  return (
    <ToastPrimitive.Provider limit={3} timeout={TIMEOUT}>
      {children}
      <ToastPrimitive.Portal>
        <ToastPrimitive.Viewport className="jb-toast-viewport">
          <ToastList />
        </ToastPrimitive.Viewport>
      </ToastPrimitive.Portal>
    </ToastPrimitive.Provider>
  );
}

const typeIcon: Record<ToastType, ReactNode> = {
  info: null,
  success: <HugeiconsCircleCheckIcon className="text-success" />,
  danger: <HugeiconsBadgeAlertIcon className="text-danger" />,
};

function ToastList() {
  const { toasts } = ToastPrimitive.useToastManager();
  return toasts.map((toast) => {
    const type = (toast.type as ToastType | undefined) ?? "info";
    const data = toast.data as ToastData | undefined;
    return (
      <ToastPrimitive.Root
        key={toast.id}
        toast={toast}
        swipeDirection={["down", "right"]}
        className="jb-toast rounded-box bg-card text-ink shadow-[0_0_0_1px_var(--line),var(--shadow-float)] focus-visible:outline-offset-2"
      >
        <ToastPrimitive.Content className="jb-toast-content flex items-start gap-3 overflow-hidden p-4">
          {typeIcon[type] ? (
            <span className="mt-0.5 flex shrink-0">{typeIcon[type]}</span>
          ) : null}
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <ToastPrimitive.Title className="text-base font-semibold" />
            <ToastPrimitive.Description className="text-sm text-ink-muted" />
          </div>
          <ToastPrimitive.Action
            className={cn(
              "-my-1.5 inline-flex min-h-11 shrink-0 cursor-pointer items-center rounded-control px-3 text-sm font-bold text-violet",
              "transition-colors duration-(--dur-exit) active:bg-wash-press hover-fine:bg-wash-hover hover-fine:duration-(--dur-fast)",
            )}
          />
          <ToastPrimitive.Close
            aria-label={data?.closeLabel}
            className="-my-2 -me-2 inline-flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-control text-ink-muted transition-colors duration-(--dur-exit) hover-fine:bg-wash-hover hover-fine:text-ink"
          >
            <HugeiconsXIcon size={18} />
          </ToastPrimitive.Close>
        </ToastPrimitive.Content>
      </ToastPrimitive.Root>
    );
  });
}

type ShowToast = {
  title: ReactNode;
  description?: ReactNode;
  type?: ToastType;
  /** e.g. { label: "Undo", onClick: undoMove } */
  action?: { label: ReactNode; onClick: () => void };
  /** Screen-reader label for the close button. */
  closeLabel: string;
  /** `high` interrupts screen readers; use only for failures. */
  priority?: "low" | "high";
};

/** `const toast = useToast(); toast({ title, closeLabel })`. */
export function useToast() {
  const manager = ToastPrimitive.useToastManager();
  return useCallback(
    ({
      title,
      description,
      type = "info",
      action,
      closeLabel,
      priority,
    }: ShowToast) =>
      manager.add({
        title,
        description,
        type,
        priority: priority ?? (type === "danger" ? "high" : "low"),
        timeout: action ? TIMEOUT_WITH_ACTION : TIMEOUT,
        data: { closeLabel } satisfies ToastData,
        actionProps: action
          ? { children: action.label, onClick: action.onClick }
          : undefined,
      }),
    [manager],
  );
}
