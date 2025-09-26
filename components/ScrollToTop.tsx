"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronUp } from "lucide-react";

type Props = {
  appearAfter?: number;          
  positionClassName?: string;   
  className?: string;            
  scrollContainerId?: string;     
};

export default function ScrollToTop({
  appearAfter = 120,
  positionClassName = "fixed bottom-6 right-6",
  className = "",
  scrollContainerId,
}: Props) {
  const pathname = usePathname();   // ✅ kept
  const [visible, setVisible] = useState(false);
  const ticking = useRef(false);

  useEffect(() => {
    const el: (Window & typeof globalThis) | HTMLElement =
      scrollContainerId ? (document.getElementById(scrollContainerId) as HTMLElement) : window;

    if (!el) return; 

    const getScrollTop = () =>
      scrollContainerId ? (el as HTMLElement).scrollTop : window.scrollY;

    const onScroll = () => {
      if (!ticking.current) {
        requestAnimationFrame(() => {
          setVisible(getScrollTop() > appearAfter);
          ticking.current = false;
        });
        ticking.current = true;
      }
    };

    onScroll();

    if (scrollContainerId) {
      el.addEventListener("scroll", onScroll, { passive: true });
      return () => el.removeEventListener("scroll", onScroll);
    } else {
      window.addEventListener("scroll", onScroll, { passive: true });
      return () => window.removeEventListener("scroll", onScroll);
    }
  }, [appearAfter, scrollContainerId]);

  // ✅ use pathname: reset scroll on route change
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pathname]);

  const scrollToTop = () => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (scrollContainerId) {
      const el = document.getElementById(scrollContainerId);
      el?.scrollTo({ top: 0, behavior: prefersReduced ? "auto" : "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: prefersReduced ? "auto" : "smooth" });
    }
  };

  return (
    <div
      className={`${positionClassName} z-50 transition-opacity duration-300 ${
        visible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <Button
        size="icon"
        variant="outline"
        onClick={scrollToTop}
        aria-label="Scroll to top"
        title="Back to top"
        className={`h-11 w-11 rounded-full shadow-lg bg-white text-gray-700 hover:bg-gray-50 ${className}`}
      >
        <ChevronUp className="h-5 w-5" />
      </Button>
    </div>
  );
}