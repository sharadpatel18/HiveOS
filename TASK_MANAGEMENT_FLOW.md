# Task Management Flow (Production-Ready Target)

## Overview
This document defines the recommended production-ready task management flow for this codebase.

It is intentionally designed to align with the existing company management and team management patterns already documented in:
- `COMPANY_HIRING_RBAC.md`
- `TEAM_CREATION_MANAGEMENT.md`

This task flow assumes:
- Tasks always belong to a company.
- Tasks can optionally belong to a specific team.
- Only company members can create, view, update, or complete tasks inside that company.
- Team-level access must respect both company membership and team membership.
- Backend authorization must never rely only on client-side role checks.

The goal is to support:
- `My Tasks` at company level
- `All Tasks` at company level
- `Team Tasks` inside a team workspace
- Production-safe assignment, status changes, comments, audit history, and notifications

## Product Goals
Use task management to support real operational work, not only simple checklists.

Core outcomes:
- Managers and founders can plan and distribute work across teams.
- Team leads can manage execution inside their teams.
- Employees can view and update tasks assigned to them.
- Every important task action is auditable.
- Access stays consistent with company and team RBAC.

## Recommended Route Structure
These routes fit the navigation already hinted in `components/app-sidebar.tsx`.

### Company task routes
- `GET /company/[companyId]/tasks`
  - My Tasks page
  - Shows tasks assigned to the logged-in user in this company
- `GET /company/[companyId]/tasks/all`
  - All Tasks page
  - Shows all visible tasks in the company for privileged roles

### Team task routes
- `GET /teams/[teamId]/tasks`
  - Team Tasks page
  - Shows tasks scoped to one team

### API routes
Recommended API structure:
- `GET /api/tasks`
- `POST /api/tasks`
- `GET /api/tasks/[id]`
- `PATCH /api/tasks/[id]`
- `DELETE /api/tasks/[id]`
- `POST /api/tasks/[id]/assign`
- `POST /api/tasks/[id]/status`
- `POST /api/tasks/[id]/comments`
- `GET /api/tasks/[id]/comments`
- `GET /api/tasks/[id]/activity`

Optional later:
- `POST /api/tasks/[id]/watchers`
- `DELETE /api/tasks/[id]/watchers/[watcherId]`
- `POST /api/tasks/[id]/attachments`

## Data Model
Recommended primary tables:
- `tasks`
- `task_assignees`
- `task_comments`
- `task_activity_logs`
- `task_watchers` (optional but recommended)
- `task_labels` (optional)
- `task_label_links` (optional)

Existing related tables:
- `company`
- `company_members`
- `teams`
- `team_members`
- `users`

## Recommended Task Table Shape
Suggested columns for `tasks`:
- `id`
- `title`
- `taskNumber`
- `description`
- `companyId`
- `teamId` nullable
- `createdBy`
- `ownerId` nullable
- `priority`
- `status`
- `type`
- `startDate` nullable
- `dueDate` nullable
- `completedAt` nullable
- `completedBy` nullable
- `archivedAt` nullable
- `archivedBy` nullable
- `isPrivate`
- `estimatedHours` nullable
- `actualHours` nullable
- `createdAt`
- `updatedAt`

Recommended enums or controlled values:
- `priority`: `LOW`, `MEDIUM`, `HIGH`, `URGENT`
- `status`: `BACKLOG`, `TODO`, `IN_PROGRESS`, `IN_REVIEW`, `BLOCKED`, `DONE`, `CANCELLED`
- `type`: `TASK`, `BUG`, `FEATURE`, `IMPROVEMENT`

Recommended rules:
- `taskNumber` should be company-scoped and human-readable like `HIVE-104`.
- `teamId` should be nullable so company-wide tasks are possible.
- `ownerId` means the person primarily responsible.
- `createdBy` and `completedBy` should always be preserved for audit.
- `isPrivate` should only be allowed for founder/manager/team lead use cases if you truly need it.

## Recommended Assignee Table Shape
Use `task_assignees` even if you start with single-owner tasks.

Suggested columns:
- `id`
- `taskId`
- `userId`
- `assignedBy`
- `assignedAt`
- `createdAt`

Recommended rules:
- Start with one active assignee in UI if you want simplicity.
- Keep the database ready for multi-assignee support.
- Enforce uniqueness on `taskId + userId`.

## Multi-Assignee Task Model
One task can be assigned to multiple users.

Recommended structure:
- keep one row in `tasks`
- keep many related rows in `task_assignees`
- optionally keep one `ownerId` in `tasks` as the primary responsible person

Example:
- Task: `Release mobile dashboard`
- Owner: one team lead or one primary executor
- Assignees:
  - designer
  - frontend developer
  - QA engineer

Recommended production rule:
- `ownerId` = single accountable person
- `task_assignees` = all users actively working on the task

This gives you:
- one clear responsible person
- many contributors
- cleaner reporting for `My Tasks`
- simpler notifications and audit history

## Recommended Multi-Assignee Rules
If multiple users are assigned to one task, define these rules clearly.

### Responsibility
- `ownerId` is the main accountable person
- assignees are contributors
- if `ownerId` is null, founders/managers/team leads remain fallback decision-makers

### Visibility
- all assignees can view the task
- all assignees can comment on the task
- all privileged users with company or team access can still view and manage the task

### Status updates
- assignees can move their own shared task forward if policy allows
- team leads can update task status inside their team
- founders and managers can update any task in their company

### Completion policy
Pick one rule and keep it consistent in backend and UI.

Recommended MVP choice:
- any assignee can move task status during execution
- only `ownerId`, `TEAMLEAD`, `MANAGER`, or `FOUNDER` can mark final `DONE`

Other valid options:
- any assignee can mark task `DONE`
- all assignees must confirm before task becomes `DONE`

Recommended production choice for now:
- use one accountable owner plus multiple assignees
- allow only owner or privileged roles to finalize completion

### Reassignment
- founders and managers can add or remove any assignee in company scope
- team leads can add or remove assignees only inside their own team
- employees cannot reassign other users

## Recommended Create Payload for Multi-Assignee Tasks
Example request body:

```json
{
  "title": "Prepare Q2 hiring dashboard",
  "description": "Collect metrics, build widgets, and verify filters.",
  "teamId": "team_uuid",
  "priority": "HIGH",
  "status": "TODO",
  "ownerId": "user_uuid_1",
  "assigneeIds": ["user_uuid_1", "user_uuid_2", "user_uuid_3"],
  "dueDate": "2026-04-10T00:00:00.000Z"
}
```

Recommended validation:
- `assigneeIds` must be an array
- remove duplicates before insert
- every assignee must belong to the same company
- for team tasks, every assignee must belong to that team
- if `ownerId` is present, it should usually also exist in `assigneeIds`

## Recommended Multi-Assignee Backend Flow
When creating or updating a multi-user task:

1. Validate `assigneeIds` as a clean unique array.
2. Resolve requester company membership.
3. Verify task scope belongs to the same company.
4. Verify every assignee belongs to the same company.
5. If team-scoped, verify every assignee belongs to the same team.
6. Insert or update the `tasks` row.
7. Insert assignees into `task_assignees`.
8. Add activity logs for each assignment.
9. Notify every newly assigned user.

For updates:
- compare previous assignees vs new assignees
- log `TASK_ASSIGNED` for added users
- log `TASK_UNASSIGNED` for removed users
- avoid deleting and recreating everything blindly if you want cleaner audit history

## Recommended Comment Table Shape
Suggested columns for `task_comments`:
- `id`
- `taskId`
- `userId`
- `body`
- `editedAt` nullable
- `createdAt`
- `updatedAt`

Recommended rules:
- Soft-limit comment length in validation.
- Preserve edit history through activity logs.
- Never hard-delete comments without admin-level intent.

## Recommended Activity Log Table Shape
Suggested columns for `task_activity_logs`:
- `id`
- `taskId`
- `actorId`
- `action`
- `fieldName` nullable
- `oldValue` nullable
- `newValue` nullable
- `metadata` nullable
- `createdAt`

Example action values:
- `TASK_CREATED`
- `TASK_UPDATED`
- `TASK_ASSIGNED`
- `TASK_UNASSIGNED`
- `STATUS_CHANGED`
- `COMMENT_ADDED`
- `COMMENT_EDITED`
- `DUE_DATE_CHANGED`
- `TASK_COMPLETED`
- `TASK_ARCHIVED`
- `TASK_REOPENED`

This table is important for production support, debugging, and future notifications.

## Visibility Model
A user can access a task only if all required scopes match.

### Company scope
User must belong to the same company through `company_members`.

### Team scope
If `task.teamId` is set:
- Founder and manager can view all team tasks in their company.
- Team lead can view tasks for teams they lead or belong to, depending on your final policy.
- Employee can view tasks if they belong to that team or are directly assigned.

### Personal scope
For `My Tasks`:
- Show tasks where the current user is owner or assignee.
- Optionally include tasks they created if you want a "created by me" filter.

## Role Model for Tasks
Use the same role vocabulary already present in the app:
- `FOUNDER`
- `MANAGER`
- `TEAMLEAD`
- `EMPLOYEE`
- `RECRUITER` only if recruiter task access is intentionally supported

Recommended baseline:
- Founder: full company-wide task access
- Manager: company-wide task planning and management
- Team Lead: manage tasks inside assigned teams
- Employee: manage progress of their own tasks only
- Recruiter: only task access if linked to hiring workflows; otherwise no general task management

## Recommended Task Permission Matrix
### Founder
Can:
- create company-level tasks
- create team tasks
- assign tasks to any company member
- view all company tasks
- edit any task in company
- delete tasks
- archive tasks
- reopen tasks
- comment on all tasks

### Manager
Can:
- create company-level tasks
- create team tasks
- assign tasks to any company member in same company
- view all company tasks
- edit most task fields
- archive tasks
- reopen tasks
- delete tasks if your policy allows it

### Team Lead
Can:
- create tasks for their own team
- assign tasks only to members of their own team
- view tasks for their own team
- update priority, due date, status, assignee inside their team
- comment on their team tasks
- cannot manage unrelated company-wide tasks unless explicitly allowed

### Employee
Can:
- view tasks assigned to them
- view public tasks in their team if allowed
- update status of their own assigned tasks
- add comments to tasks they can access
- cannot reassign tasks
- cannot delete tasks
- cannot edit restricted fields like company, team, creator, or privacy

## Recommended Creation Flow
Endpoint: `POST /api/tasks`

### What should happen
1. Auth is required.
2. Validate request with `taskValidation`.
3. Resolve requester membership from `company_members`.
4. Never trust `companyId` blindly from client.
5. If `teamId` is present, verify the team belongs to requester's company.
6. Verify requester has permission to create task in the requested scope.
7. If assignees are included, verify every assignee belongs to same company.
8. If task is team-scoped, verify assignees belong to that team unless founder/manager policy says otherwise.
9. Generate `taskNumber` server-side.
10. Insert into `tasks`.
11. Insert assignees into `task_assignees`.
12. Insert activity log entry `TASK_CREATED`.
13. Insert assignment activity rows if assignees exist.
14. Trigger notifications for assignees.
15. Return `201` with full created payload.

### Validation rules
Require at minimum:
- `title`
- `priority`
- `status` defaulted to `TODO`
- `companyId` derived from server membership, not trusted from body

Optional but validated:
- `description`
- `teamId`
- `ownerId`
- `dueDate`
- `assigneeIds`
- `estimatedHours`

Reject when:
- requester is not a company member
- `teamId` belongs to another company
- assignee is not in company
- assignee is not in team for team-scoped task
- due date is before start date
- empty title after trim
- `assigneeIds` contains invalid or duplicate values
- `ownerId` is outside the company or team scope

## Recommended My Tasks Flow
Route: `GET /company/[companyId]/tasks`

Expected behavior:
1. Auth is required.
2. Verify requester belongs to the company in route.
3. Fetch tasks where current user is owner or assignee.
4. Include useful filters:
- status
- priority
- due date
- team
- created by me
- overdue only
5. Sort default:
- overdue first
- then urgent/high priority
- then nearest due date
- then latest updated

Recommended UI sections:
- overdue tasks
- due today
- in progress
- completed recently

Important query rule for multi-assignee support:
- `My Tasks` should include tasks where the user exists in `task_assignees`
- do not rely only on `ownerId`

## Recommended All Tasks Flow
Route: `GET /company/[companyId]/tasks/all`

Expected behavior:
1. Auth is required.
2. Verify requester belongs to the company.
3. Verify requester role is founder, manager, or another explicitly allowed privileged role.
4. Fetch all visible company tasks.
5. Support filters:
- team
- assignee
- creator
- priority
- status
- type
- due date range
- archived or active
6. Support pagination.
7. Support server-side sorting.

Recommended default table columns:
- task number
- title
- team
- assignee
- priority
- status
- due date
- updated at

## Recommended Team Tasks Flow
Route: `GET /teams/[teamId]/tasks`

Expected behavior:
1. Auth is required.
2. Verify requester belongs to the team or has company-wide privileged access.
3. Fetch tasks for this team.
4. Show board and list view if possible.
5. Allow create-task CTA only for allowed team roles.
6. Allow assignee filtering to team members only.

Recommended board columns:
- `TODO`
- `IN_PROGRESS`
- `IN_REVIEW`
- `BLOCKED`
- `DONE`

Production note:
- If you add drag-and-drop, backend still must validate every status transition and access rule.
- Never let board movement bypass permission enforcement.

## Recommended Task Detail Flow
Endpoint: `GET /api/tasks/[id]`

What should happen:
1. Auth is required.
2. Load task by id.
3. Verify requester has access through company scope and, if needed, team scope.
4. Return:
- task core data
- assignees
- creator summary
- owner summary
- team summary
- recent comments
- activity history preview

Use this detail payload for task drawer or full detail page.

Recommended detail response shape:

```json
{
  "id": "task_uuid",
  "taskNumber": "HIVE-104",
  "title": "Prepare Q2 hiring dashboard",
  "owner": {
    "id": "user_uuid_1",
    "name": "Aarav"
  },
  "assignees": [
    { "id": "user_uuid_1", "name": "Aarav" },
    { "id": "user_uuid_2", "name": "Neha" },
    { "id": "user_uuid_3", "name": "Rohan" }
  ],
  "status": "IN_PROGRESS",
  "priority": "HIGH"
}
```

## Recommended Update Flow
Endpoint: `PATCH /api/tasks/[id]`

Editable fields depend on role.

### Founder and manager
Can update:
- title
- description
- priority
- due date
- owner
- team
- status
- estimate
- archive state

### Team lead
Can update inside their own team:
- title
- description
- priority
- due date
- status
- assignees

### Employee
Can update only on accessible assigned tasks:
- status
- completion state
- maybe description/comment if your policy allows

### Backend rules
1. Auth required.
2. Validate patch body strictly.
3. Load task and requester memberships.
4. Check field-level permission, not only task-level permission.
5. Reject illegal cross-company or cross-team moves.
6. Record activity logs per changed field.
7. If status becomes `DONE`, set `completedAt` and `completedBy`.
8. If task is reopened, clear completion metadata.
9. Return updated task.

## Recommended Assignment Flow
Endpoint: `POST /api/tasks/[id]/assign`

What should happen:
1. Auth required.
2. Verify task access.
3. Verify requester has assignment permission.
4. Validate every target assignee belongs to same company.
5. If task is team-scoped, validate assignees belong to that team.
6. Upsert into `task_assignees`.
7. Remove unselected assignees if API is replace-style.
8. Write `TASK_ASSIGNED` and `TASK_UNASSIGNED` logs.
9. Notify newly assigned users.

Recommended policy:
- Founder and manager can assign across company.
- Team lead can assign only within their own team.
- Employee cannot assign.

If supporting multiple assignees:
- accept `assigneeIds: string[]`
- treat the endpoint as either:
  - replace-style: full new assignee list
  - add/remove-style: explicit `addAssigneeIds` and `removeAssigneeIds`

Recommended MVP:
- use replace-style for simpler UI and backend
- diff old vs new assignees before writing logs

## Recommended Status Change Flow
Endpoint: `POST /api/tasks/[id]/status`

Use a dedicated endpoint if you want clearer audit rules and lighter payloads.

Recommended transitions:
- `BACKLOG -> TODO`
- `TODO -> IN_PROGRESS`
- `IN_PROGRESS -> IN_REVIEW`
- `IN_REVIEW -> DONE`
- `IN_PROGRESS -> BLOCKED`
- `BLOCKED -> IN_PROGRESS`
- `DONE -> IN_PROGRESS` for reopen
- `TODO -> CANCELLED`

Recommended transition rules:
- Assignee can move their own task forward.
- Team lead can move any task in their team.
- Founder and manager can move any task in company.
- Completion should set completion metadata.
- Reopen should log explicit reason if possible.

For multi-assignee tasks, recommended status rule:
- any assignee can move shared work between active states like `TODO`, `IN_PROGRESS`, and `IN_REVIEW`
- final `DONE` should be restricted to `ownerId` or privileged roles unless you intentionally want looser completion

## Recommended Comment Flow
Endpoints:
- `GET /api/tasks/[id]/comments`
- `POST /api/tasks/[id]/comments`

What should happen:
1. Auth required.
2. Verify requester can access task.
3. Validate comment body.
4. Insert comment.
5. Insert `COMMENT_ADDED` activity log.
6. Notify watchers or assignees if needed.

Recommended permissions:
- Anyone who can view the task can comment.
- Editing own comment should be allowed.
- Deleting comment should be limited to author plus privileged moderators.

## Recommended Delete and Archive Policy
Prefer archive over hard delete in production.

### Archive flow
Endpoint: `PATCH /api/tasks/[id]`
- Set `archivedAt`
- Set `archivedBy`
- Hide from default active views
- Keep accessible through archived filters and audit logs

### Hard delete flow
Endpoint: `DELETE /api/tasks/[id]`
Recommended restrictions:
- Founder only, or founder plus manager
- Only if task has no compliance need to retain history
- Delete children safely or soft-delete instead

Production recommendation:
- Use soft delete / archive first.
- Only hard delete when absolutely necessary.

## Notification Strategy
Recommended notification triggers:
- task assigned
- due date changed
- task overdue
- status changed to blocked
- comment added while user is assignee or watcher
- task completed

Start simple:
- in-app notifications or toast after mutation
- email only for assignment and overdue reminders

## Audit and Observability Requirements
For production readiness, task flows should be observable.

Recommended requirements:
- log every create/update/assign/status/archive action in `task_activity_logs`
- include actor id and timestamp
- preserve old/new values for sensitive fields
- expose recent activity in task detail UI
- avoid silent mutations without history

## Recommended Query and Pagination Strategy
For `All Tasks` and large teams:
- use cursor or offset pagination
- filter server-side, not client-side only
- index by `companyId`, `teamId`, `status`, `priority`, `dueDate`, `createdBy`
- index `task_assignees.userId` for fast "My Tasks"

Recommended indexes:
- `tasks(company_id, status)`
- `tasks(company_id, team_id)`
- `tasks(company_id, due_date)`
- `tasks(company_id, updated_at)`
- `task_assignees(task_id, user_id)` unique
- `task_assignees(user_id)`
- `task_comments(task_id, created_at)`
- `task_activity_logs(task_id, created_at)`

## Suggested UI Rules
### My Tasks page
Best for daily execution.

Include:
- quick filters
- compact list
- due date badges
- priority badges
- mark complete action
- comment shortcut

### All Tasks page
Best for managers and founders.

Include:
- table view
- saved filters
- bulk status update later
- export later if needed
- team and assignee drill-down

### Team Tasks page
Best for team execution.

Include:
- board view by status
- list view toggle
- create task dialog scoped to team
- only team members in assignee selector
- multi-select assignee input
- stacked avatars or assignee count on task cards

### Task detail drawer or page
Include:
- title and task number
- description
- assignees
- priority
- status
- team
- due date
- comments
- activity timeline
- clear owner label
- full assignee list with add/remove controls for privileged users

## Validation Checklist
Create a shared validation source such as `validations/tasks.validation.ts`.

Validate:
- title length
- description length
- allowed status values
- allowed priority values
- valid UUIDs for task, team, assignee
- no duplicate assignee ids
- due date and start date logic
- field-level patch safety
- owner/assignee relationship rules

## Suggested Service and Hook Layer
Recommended client files:
- `services/tasks-service.ts`
- `hooks/use-tasks.ts`
- `hooks/use-task-details.ts`
- `hooks/use-my-tasks.ts`
- `hooks/use-team-tasks.ts`

Recommended responsibilities:
- services handle fetch/mutation
- hooks handle query keys, caching, optimistic updates, invalidation
- all mutation success paths should invalidate both detail and list queries where relevant

Recommended query keys:
- `queryKeys.tasks.all(companyId, filters)`
- `queryKeys.tasks.mine(companyId, filters)`
- `queryKeys.tasks.team(teamId, filters)`
- `queryKeys.tasks.detail(taskId)`
- `queryKeys.tasks.comments(taskId)`
- `queryKeys.tasks.activity(taskId)`

## Suggested Backend Enforcement Checklist
1. Never trust `companyId`, `teamId`, or assignee ids without membership checks.
2. Resolve requester membership from `company_members` every time.
3. For team tasks, verify team belongs to same company.
4. For team-lead actions, verify requester actually belongs to that team.
5. Enforce field-level permissions for updates.
6. Keep role naming consistent as `TEAMLEAD`, not mixed variants.
7. Record activity logs for every meaningful mutation.
8. Invalidate or refetch task data after create, assign, update, or comment actions.
9. Use archive instead of immediate hard delete by default.
10. Build UI permissions from the same role matrix used in backend.

## Recommended Implementation Order
Build in this order to reduce rework:

1. Create database schemas:
- `db/schemas/task/tasks.ts`
- `db/schemas/task/task-assignees.ts`
- `db/schemas/task/task-comments.ts`
- `db/schemas/task/task-activity-logs.ts`

2. Add validations:
- `validations/tasks.validation.ts`

3. Add task types and role helpers:
- `types/task.ts`

4. Build core APIs:
- create task
- list my tasks
- list all tasks
- list team tasks
- get task detail
- patch task

5. Add assignment and status endpoints.

6. Add comments and activity timeline.

7. Build UI pages:
- `/company/[companyId]/tasks`
- `/company/[companyId]/tasks/all`
- `/teams/[teamId]/tasks`

8. Add notifications and overdue handling.

## Recommended MVP Scope
If you want the first version to stay realistic, ship this first:
- create task
- my tasks page
- all tasks page
- team tasks page
- multi-assignee support with one primary owner
- status update
- due date
- priority
- comments
- activity logs

Keep these for phase 2:
- multi-assignee
- attachments
- watchers
- recurring tasks
- subtasks
- time tracking
- saved views
- automation rules

## Open Decisions To Lock Before Implementation
These should be decided once so UI and API stay aligned:

1. Can recruiter access tasks at all, or only hiring-related tasks?
2. Can team leads create company-level tasks, or only team-scoped tasks?
3. Can employees view all tasks in their team, or only assigned tasks?
4. Can managers delete tasks, or only archive them?
5. Do you want single assignee MVP or multi-assignee from day one?
6. Do you want private tasks in MVP, or only public company/team tasks?

Recommended answer:
- support multi-assignee from day one in the database and API
- keep the UI simple with one owner plus multiple assignees

## Key Files To Add
Recommended future files:
- `db/schemas/task/tasks.ts`
- `db/schemas/task/task-assignees.ts`
- `db/schemas/task/task-comments.ts`
- `db/schemas/task/task-activity-logs.ts`
- `types/task.ts`
- `validations/tasks.validation.ts`
- `services/tasks-service.ts`
- `hooks/use-tasks.ts`
- `hooks/use-my-tasks.ts`
- `hooks/use-team-tasks.ts`
- `app/api/tasks/route.ts`
- `app/api/tasks/[id]/route.ts`
- `app/api/tasks/[id]/assign/route.ts`
- `app/api/tasks/[id]/status/route.ts`
- `app/api/tasks/[id]/comments/route.ts`
- `app/api/tasks/[id]/activity/route.ts`
- `app/company/[companyId]/tasks/page.tsx`
- `app/company/[companyId]/tasks/all/page.tsx`
- `app/teams/[teamId]/tasks/page.tsx`

## Final Recommendation
Treat task management as a company-and-team-scoped workflow system, not just a standalone CRUD table.

If you follow this design:
- it will stay consistent with your company flow
- it will respect your team flow
- it will scale from simple task lists to real production team operations
- it will avoid the most common RBAC and data-scoping bugs already visible in the current management flows
