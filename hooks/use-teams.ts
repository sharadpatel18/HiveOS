"use client";

import { queryKeys } from "@/lib/query-keys";
import { getTeams, getTeamsById } from "@/services/teams-services";
import { useQuery } from "@tanstack/react-query";

export const useTeams = () => {
  return useQuery({
    queryKey: queryKeys.teams,
    queryFn: getTeams,
    staleTime: 1000 * 60 * 5, // ← keep data fresh for 5 mins
    refetchOnMount: true, // ← always refetch when component mounts
    refetchOnWindowFocus: false,
  });
};

export const useTeamsDetails = (teamId: string) => {
  return useQuery({
    queryKey: queryKeys.teamsById,
    queryFn: () => getTeamsById(teamId),
    enabled: !!teamId,
    staleTime: 1000 * 60 * 5, // ← keep data fresh for 5 mins
    refetchOnMount: true, // ← always refetch when component mounts
    refetchOnWindowFocus: false,
  });
};
