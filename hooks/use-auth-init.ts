"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/auth-store";
import { getUserData } from "@/services/auth-services";

export const useAuthInit = () => {
  const setUser = useAuthStore((s) => s.setUser);

  useEffect(() => {
    const loadUser = async () => {
      const user = await getUserData();
      setUser(user);
    };

    loadUser();
  }, [setUser]);
};
