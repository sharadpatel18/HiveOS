import { create } from "zustand";
import { AuthUser } from "@/types/user";

type AuthState = {
  user: AuthUser;
  setUser: (user: AuthUser) => void;
  logout: () => void;
  clearUser: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  logout: () => set({ user: null }),
  clearUser: () => set({ user: null }),
}));
