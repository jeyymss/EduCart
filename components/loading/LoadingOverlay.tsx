"use client";
import { createContext, useContext, useMemo, useRef, useState, ReactNode } from "react";

type LoadingOptions = {
  delay?: number;       
  minDuration?: number;  
  message?: string;
};

type LoadingContextType = {
  show: (msg?: string) => void;
  hide: () => void;
  withLoading: <T>(work: Promise<T> | (() => Promise<T>), opts?: LoadingOptions) => Promise<T>;
  isLoading: boolean;
  message?: string;
};

const LoadingContext = createContext<LoadingContextType | null>(null);

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | undefined>();
  const shownAtRef = useRef<number | null>(null);
  const pendingDelayRef = useRef<number | null>(null);

  const show = (msg?: string) => {
    window.clearTimeout(pendingDelayRef.current ?? undefined);
    setMessage(msg || "Updating results…");
    setIsLoading(true);
    shownAtRef.current = Date.now();
  };

  const hide = () => {
    window.clearTimeout(pendingDelayRef.current ?? undefined);
    setIsLoading(false);
    setMessage(undefined);
    shownAtRef.current = null;
  };

  const withLoading = async <T,>(
    work: Promise<T> | (() => Promise<T>),
    opts?: LoadingOptions
  ): Promise<T> => {
    const { delay = 250, minDuration = 300, message } = opts || {};

    await new Promise<void>((resolve) => {
      const id = window.setTimeout(() => {
        pendingDelayRef.current = null;
        show(message);
        resolve();
      }, delay);
      pendingDelayRef.current = id;
      resolve(); 
    });

    const run = typeof work === "function" ? work() : work;

    try {
      const result = await run;

      if (shownAtRef.current) {
        const elapsed = Date.now() - shownAtRef.current;
        const waitMore = Math.max(0, minDuration - elapsed);
        if (waitMore > 0) await new Promise((r) => setTimeout(r, waitMore));
      } else {
        window.clearTimeout(pendingDelayRef.current ?? undefined);
      }
      hide();
      return result;
    } catch (e) {
      hide();
      throw e;
    }
  };

  const value = useMemo<LoadingContextType>(
    () => ({ show, hide, withLoading, isLoading, message }),
    [isLoading, message]
  );

  return (
    <LoadingContext.Provider value={value}>
      {children}
      {isLoading && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/25 backdrop-blur-sm">
          <div className="rounded-xl bg-white px-8 py-6 shadow-lg flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full border-4 border-[#E59E2C] border-t-transparent animate-spin" />
            <div className="text-sm font-medium text-[#2F4157]">
              {message}
            </div>
          </div>
        </div>
      )}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const ctx = useContext(LoadingContext);
  if (!ctx) throw new Error("useLoading must be used within LoadingProvider");
  return ctx;
}
