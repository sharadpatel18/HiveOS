"use client";

import { useQuery } from "@tanstack/react-query";
import { getCompanyByUserId } from "@/services/company-service";
import { queryKeys } from "@/lib/query-keys";

export const useCompany = () => {
  return useQuery({
    queryKey: queryKeys.company,
    queryFn: getCompanyByUserId,
    staleTime: Infinity,
  });
};
