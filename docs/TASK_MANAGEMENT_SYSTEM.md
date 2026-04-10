# Task Management System

## Overview

The current task management system is a team-scoped Kanban workflow built on top of:

- Next.js App Router pages and API routes
- Drizzle ORM with PostgreSQL tables for tasks and assignments
- React Query for fetching and invalidation
- `dnd-kit` for drag-and-drop status changes

At the moment, tasks belong to both a `company` and a `team`, and each task can be assigned to multiple users through a junction table.

## Main Entry Points

### UI

- `app/teams/[teamId]/tasks/page.tsx`
- `app/teams/[teamId]/tasks/components/tasks-content.tsx`
- `app/teams/[teamId]/tasks/components/task-detail-drawer.tsx`

### Client Data Layer

- `hooks/use-tasks.ts`
- `services/task-service.ts`
- `hooks/use-company.ts`
- `hooks/use-teams.ts`

### Server API

- `app/api/tasks/route.ts`
- `app/api/tasks/[id]/route.ts`

### Validation and Types

- `validations/task.validation.ts`
- `types/task.ts`

### Database

- `db/schemas/tasks/tasks.ts`
- `db/schemas/tasks/task_assignment.ts`
- `db/schemas/team/team_members.ts`

## Data Model

### `tasks` table

Stores the main task record:

- `id`
- `title`
- `description`
- `priority`
- `dueDate`
- `status`
- `companyId`
- `teamId`
- `createdAt`
- `updatedAt`

Notes:

- The DB column for status is currently named `done`, but the app treats it as task status.
- Supported statuses are:
  - `NOT_STARTED`
  - `IN_PROGRESS`
  - `IN_REVIEW`
  - `COMPLETED`
  - `CANCELLED`
- Supported priorities are:
  - `LOW`
  - `MEDIUM`
  - `HIGH`
  - `URGENT`

### `task_assignments` table

Stores many-to-many task assignment records:

- `taskId`
- `userId`
- `assignedById`
- `assignedAt`

This allows one task to be assigned to multiple users.

## Current User Flow

### 1. Opening the team task board

When a user opens `/teams/[teamId]/tasks`:

1. `useCompany()` loads the current company context from `/api/company`.
2. `useGetTasksByTeam(companyId, teamId)` loads tasks from `/api/tasks`.
3. `useTeamsDetails(teamId)` loads team info and team members from `/api/teams/[id]`.
4. `TasksContent` groups tasks into Kanban columns by status.

### 2. Creating a task

The create dialog collects:

- title
- description
- priority
- status
- due date
- assignees

Validation is done on the client with `taskValidation`, then the payload is sent to `POST /api/tasks`.

Server-side creation flow:

1. Check auth with `withAuth()`.
2. Restrict creation to `FOUNDER`, `MANAGER`, or `TEAMLEAD`.
3. Validate payload with Zod.
4. Confirm the team belongs to the supplied company.
5. Confirm the assigner exists.
6. Validate assignees against team/company membership checks.
7. Insert the task into `tasks`.
8. Insert assignment rows into `task_assignments`.

### 3. Viewing tasks

`GET /api/tasks?companyId=...&teamId=...` returns the task list for a team.

The API joins:

- `tasks`
- `task_assignments`
- `users`

Then it groups joined rows into a frontend-friendly structure:

- one task object
- an `assignees` array under that task

### 4. Viewing task details

Clicking a card opens `TaskDetailDrawer`.

The drawer fetches `GET /api/tasks/[id]`, which returns:

- the task record
- assignee user details
- `assignedBy` details for each assignee row

### 5. Updating task status

Desktop drag-and-drop uses `dnd-kit`.

Current behavior:

1. Dragging a card updates local UI state optimistically.
2. Dropping it in another column sends `PATCH /api/tasks/[id]` with only the new `status`.
3. React Query invalidates the team task query and refreshes the board.

### 6. Deleting a task

Deleting a task calls `DELETE /api/tasks/[id]`.

Allowed roles:

- `FOUNDER`
- `MANAGER`
- `TEAMLEAD`

Deleting a task removes the task row, and assignment rows are cleaned up by cascade.

## Frontend State and Sync

The task page uses a mix of:

- server state from React Query
- local optimistic state in `localTasks`
- manual invalidation through `useInvalidateTasks`

React Query cache key:

- `["tasks", companyId, teamId]`

This means all task refreshes are scoped to a specific company/team board.

## Validation Rules

`taskValidation` currently enforces:

- title: 2 to 30 characters
- description: required
- due date: required valid date
- priority: enum
- status: enum
- teamId: UUID
- companyId: UUID
- assignedById: UUID
- assigneeIds: at least one UUID

`updateTaskValidation` is a partial version of the create schema plus required task `id`.

## Authorization Rules

### Enforced

- Create: `FOUNDER`, `MANAGER`, `TEAMLEAD`
- Update: `FOUNDER`, `MANAGER`, `TEAMLEAD`
- Delete: `FOUNDER`, `MANAGER`, `TEAMLEAD`

### Not fully enforced

- Task list `GET /api/tasks` has a role check commented out, so listing is currently less restricted than create/update/delete.

## Important Current Gaps

These are the main implementation details to be aware of in the current system:

### Edit dialog does not fully persist edited fields

The edit modal shows title, description, priority, due date, status, and assignees, but the submit handler currently sends only:

- `id`
- `status`

So right now, editing mostly behaves like a status update form, not a full task edit flow.

### Assigner ID is not based on the active session user

The task page currently passes `company.userId` into `assignedById`.

That means the assigner is effectively the company owner/founder from company data, not necessarily the user who is currently creating the task.

### Assignee identity is inconsistent across flows

The create flow uses team member records from `/api/teams/[id]`, while task detail/list responses expose assignee user IDs.

Because of that, the ID shape is not fully consistent between:

- team member selection
- task list data
- task detail data

### Local state sync can be improved

`TasksContent` initializes `localTasks` during render when server tasks arrive. It works, but this would be safer and cleaner in an effect instead of setting state during render.

### Type file is ahead of implementation

`types/task.ts` includes richer payloads like replacing assignees on update, but the current API/UI implementation does not fully support that behavior yet.

## End-to-End Summary

The current task management system already supports:

- team-level Kanban boards
- multi-user assignment
- task detail view
- drag-and-drop status changes
- role-gated create/update/delete

The main next-step work, if you want to improve it, would likely be:

1. Make edit update all task fields.
2. Normalize assignee IDs across API and UI.
3. Use the current session user as `assignedById`.
4. Re-enable or redesign task list authorization.
5. Move local task hydration into a `useEffect`.
