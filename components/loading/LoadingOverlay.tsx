"use client";
import { createContext, useContext, useMemo, useState, ReactNode } from "react";

type LoadingContextType = {
  show: (msg?: string) => void;
  hide: () => void;
  isLoading: boolean;
  message?: string;
};

const LoadingContext = createContext<LoadingContextType | null>(null);

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | undefined>();

  const value = useMemo<LoadingContextType>(
    () => ({
      show: (msg?: string) => {
        setMessage(msg || "Updating results…");
        setIsLoading(true);
      },
      hide: () => {
        setIsLoading(false);
        setMessage(undefined);
      },
      isLoading,
      message,
    }),
    [isLoading, message]
  );

  return (
    <LoadingContext.Provider value={value}>
      {children}

      {isLoading && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="rounded-xl bg-white px-8 py-6 shadow-lg flex flex-col items-center gap-3">
            {/* Spinner */}
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
