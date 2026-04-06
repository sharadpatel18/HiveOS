import { z } from "zod";
import { taskPriorities, taskStatuses } from "@/types/task";

export const taskValidation = z.object({
  title: z
    .string()
    .min(2, "Title must be at least 2 characters")
    .max(30, "Title must be at most 30 characters"),
  description: z.string().min(1, "Description is required"),
  dueDate: z.coerce.date({
    required_error: "Due date is required",
    invalid_type_error: "Invalid due date",
  }),
  priority: z.enum(taskPriorities).default("MEDIUM"),
  status: z.enum(taskStatuses).default("NOT_STARTED"),
  teamId: z.string().uuid("Invalid team ID"),
  companyId: z.string().uuid("Invalid company ID"),
  assignedById: z.string().uuid("Invalid assigner ID"),
  assigneeIds: z
    .array(z.string().uuid("Invalid assignee ID"))
    .min(1, "At least one assignee is required"),
});

export const updateTaskValidation = taskValidation.partial().extend({
  id: z.string().uuid("Invalid task ID"),
});
export type TaskValidationInput = z.infer<typeof taskValidation>;
export type UpdateTaskValidationInput = z.infer<typeof updateTaskValidation>;
