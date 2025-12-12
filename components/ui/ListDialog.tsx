"use client";

import { X } from "lucide-react";
import { useEffect, useRef } from "react";

interface ListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export function ListDialog({ open, onOpenChange, children }: ListDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onOpenChange(false);
      }
    };

    if (open) {
      document.addEventListener("keydown", handleEscape);
      // Prevent body scroll when dialog is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [open, onOpenChange]);

  // Close on backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onOpenChange(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={handleBackdropClick}
    >
      <div
        ref={dialogRef}
        className="
          relative
          w-full
          max-w-[95vw]
          sm:max-w-[90vw]
          md:max-w-3xl
          lg:max-w-4xl
          max-h-[92vh]
          sm:max-h-[90vh]
          bg-white
          rounded-2xl
          shadow-2xl
          overflow-hidden
          animate-in
          zoom-in-95
          slide-in-from-bottom-4
          duration-300
          m-4
        "
      >
        {/* Close Button */}
        <button
          onClick={() => onOpenChange(false)}
          className="
            absolute
            top-4
            right-4
            z-10
            p-2
            rounded-full
            bg-gray-100
            hover:bg-gray-200
            text-gray-600
            hover:text-gray-900
            transition-all
            duration-200
            hover:scale-110
          "
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Scrollable Content */}
        <div className="overflow-y-auto max-h-[92vh] sm:max-h-[90vh]">
          {children}
        </div>
      </div>
    </div>
  );
}

interface ListDialogHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function ListDialogHeader({
  children,
  className = "",
}: ListDialogHeaderProps) {
  return (
    <div
      className={`
        px-6
        sm:px-8
        pt-6
        sm:pt-8
        pb-4
        border-b
        border-gray-200
        bg-gradient-to-b
        from-gray-50
        to-white
        ${className}
      `}
    >
      {children}
    </div>
  );
}

interface ListDialogTitleProps {
  children: React.ReactNode;
  className?: string;
}

export function ListDialogTitle({
  children,
  className = "",
}: ListDialogTitleProps) {
  return (
    <h2
      className={`
        text-2xl
        sm:text-3xl
        font-bold
        text-gray-800
        text-center
        ${className}
      `}
    >
      {children}
    </h2>
  );
}

interface ListDialogDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export function ListDialogDescription({
  children,
  className = "",
}: ListDialogDescriptionProps) {
  return (
    <p
      className={`
        text-sm
        sm:text-base
        text-gray-600
        text-center
        mt-2
        ${className}
      `}
    >
      {children}
    </p>
  );
}

interface ListDialogContentProps {
  children: React.ReactNode;
  className?: string;
}

export function ListDialogContent({
  children,
  className = "",
}: ListDialogContentProps) {
  return (
    <div
      className={`
        px-6
        sm:px-8
        py-6
        sm:py-8
        space-y-6
        ${className}
      `}
    >
      {children}
    </div>
  );
}
