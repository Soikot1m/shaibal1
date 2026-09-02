"use client";
export type ToastType = "success" | "error" | "info" | "warning";

export function toast(message: string, type: ToastType = "success", title?: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent("app:toast", { detail: { message, type, title } }),
  );
}
