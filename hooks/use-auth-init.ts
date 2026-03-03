// useAuthInit.ts
"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/auth-store";
import { getUserData } from "@/services/auth-services";

export const useAuthInit = () => {
  const setUser = useAuthStore((s) => s.setUser);
  const clearUser = useAuthStore((s) => s.clearUser);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await getUserData();
        setUser(user);
      } catch {
        // Not authenticated — clear any stale state
        clearUser();
      }
    };

    loadUser();
  }, []); // ← empty deps, runs once on mount only
};
