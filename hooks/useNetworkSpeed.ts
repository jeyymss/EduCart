"use client";

import { useEffect, useState } from "react";

export function useNetworkSpeed() {
  const [isSlowConnection, setIsSlowConnection] = useState(false);

  useEffect(() => {
    if (typeof navigator !== "undefined" && "connection" in navigator) {
      const connection = (navigator as any).connection;

      if (
        connection?.effectiveType === "2g" ||
        connection?.effectiveType === "slow-2g" ||
        connection?.saveData
      ) {
        setIsSlowConnection(true);
      }
    }
  }, []);

  return isSlowConnection;
}
