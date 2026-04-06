import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getTasksByTeamId } from "@/services/task-service";

export const taskKeys = {
  all: ["tasks"] as const,
  byTeam: (companyId: string, teamId: string) =>
    ["tasks", companyId, teamId] as const,
};

export const useGetTasksByTeam = (companyId: string, teamId: string) => {
  return useQuery({
    queryKey: taskKeys.byTeam(companyId, teamId),
    queryFn: () => getTasksByTeamId(companyId, teamId),
    enabled: !!companyId && !!teamId,
    staleTime: 1000 * 60 * 5, // ← keep data fresh for 5 mins
    refetchOnMount: true, // ← always refetch when component mounts
    refetchOnWindowFocus: false,
  });
};

export const useInvalidateTasks = (companyId: string, teamId: string) => {
  const queryClient = useQueryClient();

  return async () => {
    await queryClient.invalidateQueries({
      queryKey: taskKeys.byTeam(companyId, teamId),
    });

    await queryClient.refetchQueries({
      queryKey: taskKeys.byTeam(companyId, teamId),
    });
  };
};
