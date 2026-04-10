import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import {
  getTasksByTeamId,
  createTask,
  updateTaskById,
  deleteTaskById,
} from "@/services/task-service";

/* =========================
   Types
========================= */

type CreateTaskPayload = Parameters<typeof createTask>[0];
type UpdateTaskPayload = Parameters<typeof updateTaskById>[0];
type DeleteTaskPayload = Parameters<typeof deleteTaskById>[0];

/* =========================
   Query Keys
========================= */

export const taskKeys = {
  all: ["tasks"] as const,

  byTeam: (companyId: string, teamId: string) =>
    ["tasks", companyId, teamId] as const,
};

/* =========================
   Get Tasks
========================= */

export const useGetTasksByTeam = (companyId: string, teamId: string) => {
  return useQuery({
    queryKey: taskKeys.byTeam(companyId, teamId),
    queryFn: () => getTasksByTeamId(companyId, teamId),
    enabled: !!companyId && !!teamId,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
};

/* =========================
   Create Task
========================= */

export const useCreateTask = (companyId: string, teamId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateTaskPayload) => {
      return await createTask(payload);
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: taskKeys.byTeam(companyId, teamId),
      });
    },
  });
};

/* =========================
   Update Task
========================= */

export const useUpdateTask = (companyId: string, teamId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdateTaskPayload) => {
      return await updateTaskById(payload);
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: taskKeys.byTeam(companyId, teamId),
      });
    },
  });
};

/* =========================
   Delete Task
========================= */

export const useDeleteTask = (companyId: string, teamId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskId: DeleteTaskPayload) => {
      return await deleteTaskById(taskId);
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: taskKeys.byTeam(companyId, teamId),
      });
    },
  });
};

/* =========================
   Manual Invalidate
========================= */

export const useInvalidateTasks = (companyId: string, teamId: string) => {
  const queryClient = useQueryClient();

  return async () => {
    await queryClient.invalidateQueries({
      queryKey: taskKeys.byTeam(companyId, teamId),
    });
  };
};
