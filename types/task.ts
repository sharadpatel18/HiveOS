export const taskPriorities = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;
export const taskStatuses = [
  "NOT_STARTED",
  "IN_PROGRESS",
  "IN_REVIEW",
  "COMPLETED",
  "CANCELLED",
] as const;

export type TaskPriority = (typeof taskPriorities)[number];
export type TaskStatus = (typeof taskStatuses)[number];
// Base task shape (mirrors DB row)
export interface Task {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  due: Date;
  status: TaskStatus;
  assignedById: string; // user who created/assigned the task
  companyId: string;
  teamId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Junction table row
export interface TaskAssignment {
  taskId: string;
  userId: string; // assignee
  assignedById: string; // who performed the assignment
  assignedAt: Date;
}

// Task with assignees populated (used in most queries)
export interface TaskWithAssignees extends Task {
  assignees: TaskAssignee[];
  assignedBy: TaskAssignee; // populated user object for the assigner
}

// Minimal user shape returned when joining task_assignments → users
export interface TaskAssignee {
  id: string;
  name: string;
  email: string;
}

// ── Payloads ──────────────────────────────────────────────────────────────────

export interface CreateTaskPayload {
  title: string;
  description: string;
  priority?: TaskPriority;
  due: Date;
  status?: TaskStatus;
  assignedById: string; // user creating/assigning the task
  companyId: string;
  teamId: string;
  assigneeIds: string[]; // one or more user IDs
}

export interface UpdateTaskPayload {
  id: string;
  title?: string;
  description?: string;
  priority?: TaskPriority;
  due?: Date;
  status?: TaskStatus;
  assigneeIds?: string[]; // replaces the full assignee list when provided
}

export interface AssignTaskPayload {
  taskId: string;
  assignedById: string; // user performing the assignment
  userIds: string[]; // add these users to the task
}

export interface UnassignTaskPayload {
  taskId: string;
  userIds: string[]; // remove these users from the task
}

// ── Query filters ─────────────────────────────────────────────────────────────

export interface TaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  teamId?: string;
  companyId?: string;
  assigneeId?: string; // filter by a specific assignee
  assignedById?: string; // filter by who assigned the task
  dueBefore?: Date;
  dueAfter?: Date;
}
