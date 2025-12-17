"use client";

import { X } from "lucide-react";
import { ReactNode, useEffect, useRef } from "react";

interface TransactionFormDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  icon?: ReactNode;
  color?: "blue" | "green" | "purple" | "orange" | "amber" | "rose" | "red" | "indigo";
  children: ReactNode;
}

const colorClasses = {
  blue: {
    bg: "from-blue-50 to-blue-100",
    text: "text-blue-900",
    iconBg: "bg-blue-500",
  },
  green: {
    bg: "from-green-50 to-green-100",
    text: "text-green-900",
    iconBg: "bg-green-500",
  },
  purple: {
    bg: "from-purple-50 to-purple-100",
    text: "text-purple-900",
    iconBg: "bg-purple-500",
  },
  orange: {
    bg: "from-orange-50 to-orange-100",
    text: "text-orange-900",
    iconBg: "bg-orange-500",
  },
  amber: {
    bg: "from-amber-50 to-amber-100",
    text: "text-amber-900",
    iconBg: "bg-amber-500",
  },
  rose: {
    bg: "from-rose-50 to-rose-100",
    text: "text-rose-900",
    iconBg: "bg-rose-500",
  },
  red: {
    bg: "from-red-50 to-red-100",
    text: "text-red-900",
    iconBg: "bg-red-500",
  },
  indigo: {
    bg: "from-indigo-50 to-indigo-100",
    text: "text-indigo-900",
    iconBg: "bg-indigo-500",
  },
};

export default function TransactionFormDialog({
  open,
  onClose,
  title,
  description,
  icon,
  color = "blue",
  children,
}: TransactionFormDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  // Prevent body scroll when dialog is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      // Prevent scroll on iOS
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
    }

    return () => {
      document.body.style.overflow = "unset";
      document.body.style.position = "unset";
      document.body.style.width = "auto";
    };
  }, [open]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [open, onClose]);

  if (!open) return null;

  const colors = colorClasses[color];

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-300"
      onClick={handleBackdropClick}
    >
      <div
        ref={dialogRef}
        className="
          relative
          w-full
          sm:w-[95vw]
          sm:max-w-[90vw]
          md:max-w-3xl
          lg:max-w-4xl
          max-h-[95vh]
          sm:max-h-[90vh]
          bg-white
          rounded-t-3xl
          sm:rounded-2xl
          shadow-2xl
          overflow-hidden
          animate-in
          slide-in-from-bottom
          sm:zoom-in-95
          sm:slide-in-from-bottom-4
          duration-300
        "
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Handle - Only visible on mobile */}
        <div className="sm:hidden flex justify-center pt-2 pb-1 bg-gradient-to-b from-gray-100 to-white">
          <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
        </div>

        {/* Close Button - Enhanced for mobile */}
        <button
          onClick={onClose}
          className="
            absolute
            top-3
            right-3
            sm:top-4
            sm:right-4
            z-10
            p-2.5
            sm:p-2
            rounded-full
            bg-white
            sm:bg-gray-100
            hover:bg-gray-200
            text-gray-600
            hover:text-gray-900
            shadow-lg
            sm:shadow-none
            transition-all
            duration-200
            hover:scale-110
            active:scale-95
            cursor-pointer
            border
            border-gray-200
            sm:border-0
          "
          aria-label="Close dialog"
        >
          <X className="w-5 h-5 sm:w-5 sm:h-5" />
        </button>

        {/* Scrollable Content */}
        <div className="overflow-y-auto max-h-[95vh] sm:max-h-[90vh] overscroll-contain">
          {/* Header - Compact on mobile */}
          <div
            className={`
              px-4
              sm:px-6
              md:px-8
              pt-4
              sm:pt-6
              md:pt-8
              pb-3
              sm:pb-4
              border-b
              border-gray-200
              bg-gradient-to-b
              ${colors.bg}
            `}
          >
            <div className="flex items-center justify-center gap-2 sm:gap-3 mb-2">
              {icon && (
                <div className={`${colors.iconBg} p-2 sm:p-2.5 rounded-xl shadow-lg`}>
                  <div className="w-5 h-5 sm:w-6 sm:h-6 text-white">{icon}</div>
                </div>
              )}
            </div>
            <h2
              className={`
                text-xl
                sm:text-2xl
                md:text-3xl
                font-bold
                ${colors.text}
                text-center
                px-8
              `}
            >
              {title}
            </h2>
            {description && (
              <p
                className="
                  text-xs
                  sm:text-sm
                  md:text-base
                  text-gray-600
                  text-center
                  mt-1.5
                  sm:mt-2
                  px-4
                "
              >
                {description}
              </p>
            )}
          </div>

          {/* Content - Better mobile padding */}
          <div
            className="
              px-4
              sm:px-6
              md:px-8
              py-4
              sm:py-6
              md:py-8
              pb-6
              space-y-4
              sm:space-y-6
            "
          >
            {children}
          </div>

          {/* Bottom Safe Area for iOS */}
          <div className="h-6 sm:hidden" />
        </div>
      </div>
    </div>
  );
}
