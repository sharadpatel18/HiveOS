// auth-store.ts
import { create } from "zustand";
import { AuthUser } from "@/types/user";

type AuthState = {
  user: AuthUser;
  isInitialized: boolean; // ← add this
  setUser: (user: AuthUser) => void;
  logout: () => void;
  clearUser: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isInitialized: false, // ← add this
  setUser: (user) => set({ user, isInitialized: true }), // ← mark done
  logout: () => set({ user: null, isInitialized: true }),
  clearUser: () => set({ user: null, isInitialized: true }),
}));
