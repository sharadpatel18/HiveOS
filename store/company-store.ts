import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Company } from "@/types/company";

type CompanyState = {
  company: Company | null;
  setCompany: (company: Company | null) => void;
  clearCompany: () => void;
};

export const useCompanyStore = create<CompanyState>()(
  persist(
    (set) => ({
      company: null,
      setCompany: (company) => set({ company }),
      clearCompany: () => set({ company: null }),
    }),
    {
      name: "company-storage",
    },
  ),
);
