"use client";

import { queryKeys } from "@/lib/query-keys";
import { getTeams } from "@/services/teams-services";
import { useQuery } from "@tanstack/react-query";

export const useTeams = () => {
  return useQuery({
    queryKey: queryKeys.teams,
    queryFn: getTeams,
    staleTime: Infinity,
  });
};
