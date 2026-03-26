# Team Creation and Management Flow (Current Implementation)

## Overview
This document explains how team creation, team listing, team dashboard access, member search, member add, and member removal currently work in this codebase, based on the implemented UI and API logic.

## Data Model
Primary tables involved in the team flow:
- `teams`
- `team_members`
- `company_members`
- `users`

Relevant schema behavior:
- A team belongs to one company through `teams.companyId`.
- A team stores one `teamleadId` directly on the team row.
- Team membership is stored separately in `team_members`.
- A user must already belong to the company in `company_members` before they can be added to a team.

Sources:
- `db/schemas/team/team.ts`
- `db/schemas/team/team_members.ts`
- `db/schemas/company/company-members.ts`
- `db/schemas/user/user.ts`

## Main Client Entry Points

### Teams listing and create flow
Page: `app/teams/page.tsx`

What the page does:
1. Loads current company data with `useCompany()`.
2. Loads teams with `useTeams()`, which calls `GET /api/teams`.
3. Shows a create-team dialog for allowed roles.
4. Builds the create payload and sends it through `createTeam()` in `services/teams-services.ts`.

### Team dashboard and member management flow
Page: `app/teams/[teamId]/dashboard/page.tsx`

What the page does:
1. Reads `teamId` from route params.
2. Loads team details with `getTeamsById(teamId)`, which calls `GET /api/teams/[id]`.
3. Renders summary cards plus the team members table.
4. Uses `AddMemberDialog` to search for company members and add them to the team.
5. Uses `deleteTeamMembers()` to remove an existing team member.

## Role Model Used by Team Features
Roles currently referenced in team features:
- `FOUNDER`
- `MANAGER`
- `TEAMLEAD`
- `EMPLOYEE`

Client-side helper source:
- `types/teams.ts`

Current helper rules:
- `ASSIGNABLE_ROLES`: `TEAMLEAD`, `MANAGER`, `EMPLOYEE`
- `ADD_MEMBER_ROLES`: `MANAGER`, `FOUNDER`
- `PRIVILEGED_ROLES`: `TEAMLEAD`, `MANAGER`, `FOUNDER`

## Team Creation Flow
Endpoint: `POST /api/teams` (`app/api/teams/route.ts`)

### What happens
1. Auth is required via `withAuth()`.
2. Request body is validated with `teamValidation`.
3. The API rebuilds `slug` from `body.name`, even if the client provided a custom slug.
4. It checks that `teamleadId` exists in `users`.
5. It checks that the computed `slug` is globally unique.
6. It inserts a new row into `teams`.
7. It inserts the chosen team lead into `team_members` as the first member, using the target user's current global `users.role`.
8. Returns success.

### Create dialog behavior
UI: `app/teams/page.tsx`

Current behavior:
- Team name auto-generates slug unless the user edits slug manually.
- Only company members with `role === "TEAMLEAD"` are shown as selectable leads.
- The create button requires `name`, `slug`, and `teamleadId`.
- The dialog also allows marking the team as `personalTeam`.

### Resulting state
- A team row is created under the selected `companyId`.
- The chosen team lead is immediately inserted into `team_members`.
- No additional team members are inserted during team creation.

## Team Listing Flow
Endpoint: `GET /api/teams` (`app/api/teams/route.ts`)

### What happens
1. Auth is required.
2. The API resolves the logged-in user's company from `company_members`.
3. It fetches all teams where `teams.companyId` matches that company.
4. Returns a lightweight team list.

### Client usage
- `hooks/use-teams.ts` caches the list with React Query using `queryKeys.teams`.
- `app/teams/page.tsx` filters the list client-side by `name` and `slug`.

## Team Details Flow
Endpoint: `GET /api/teams/[id]` (`app/api/teams/[id]/route.ts`)

### What happens
1. Auth is required.
2. It fetches the team by id.
3. It fetches all `team_members` for that team and joins user name/email from `users`.
4. Returns the team row plus `members`.

### Client usage
Page: `app/teams/[teamId]/dashboard/page.tsx`

Displayed sections:
- `TeamHeader`
- `TeamStats`
- `TeamMembersTable`
- `TeamInfoCard`

Derived values:
- Team leads count is calculated by filtering members with `role === "TEAMLEAD"`.
- Current user role is taken from `session.user.role`.

## Team Member Search and Add Flow
Endpoints:
- `GET /api/teams/members?email=...&teamId=...`
- `POST /api/teams/members`

### Search flow
UI: `app/teams/[teamId]/dashboard/components/add-member-dialog.tsx`

What happens:
1. User types an email.
2. The dialog debounces for 400ms.
3. It calls `GET /api/teams/members` with `email` and `teamId`.
4. The API verifies the requester belongs to a company.
5. It finds the target user by email.
6. It rejects recruiters.
7. It verifies the target user belongs to the same company.
8. It rejects users already in that team.
9. Returns the matched user record.

### Add flow
Service: `services/teams-services.ts`

What happens:
1. The dialog passes `userId`, `teamId`, and `role` into `addTeamMember()`.
2. `POST /api/teams/members` validates the request.
3. It resolves the requester's company from `company_members`.
4. It verifies the team belongs to that same company.
5. It verifies the target user exists.
6. It rejects recruiters.
7. It verifies the target user belongs to the same company.
8. It rejects duplicate team membership.
9. It inserts into `team_members`.
10. The dashboard refetches the full team after success.

## Team Member Removal Flow
Endpoint: `DELETE /api/teams/members/[id]` (`app/api/teams/members/[id]/route.ts`)

### What happens
1. Auth is required.
2. The API requires `auth.user.role` to be `FOUNDER` or `MANAGER`.
3. It loads the target team member row.
4. If the target member role is `TEAMLEAD`, it counts all team leads in that team.
5. It blocks deletion when that user is the last remaining team lead.
6. Otherwise it deletes the `team_members` row.

### Client behavior
UI: `app/teams/[teamId]/dashboard/components/team-members-table.tsx`

Current behavior:
- Row actions are shown only when the acting user's role level is higher than the target member's role level.
- The remove action calls `deleteTeamMembers(memberId)`.
- The dashboard currently does not refetch team details after removal.

## Team Delete Flow
Endpoint: `DELETE /api/teams/[id]` (`app/api/teams/[id]/route.ts`)

### What happens
1. Auth is required.
2. The API requires `auth.user.role` to be `FOUNDER` or `MANAGER`.
3. It verifies the team exists.
4. It deletes all `team_members` for that team.
5. It deletes the team row.

### Current UI status
Page: `app/teams/page.tsx`

The list page shows delete and edit actions in the team card menu, but both are still placeholder handlers:
- edit: TODO
- delete: TODO
- add member from list page: TODO

## Current UI Access Rules
These checks are client-side and not always identical to API enforcement.

### Teams list page
File: `app/teams/page.tsx`

Current constants:
- `CAN_CREATE_TEAM = ["FOUNDER", "MANAGER"]`
- `CAN_MANAGE_TEAM = ["FOUNDER", "MANAGER", "TEAM_LEAD"]`

Effect:
- Founders and managers can open the create-team dialog.
- Team management dropdown intends to allow founders, managers, and team leads.

### Team members table
File: `app/teams/[teamId]/dashboard/components/team-members-table.tsx`

Current helper behavior:
- `canAddMembers()` only allows founders and managers.
- Remove actions depend on role hierarchy comparison.

## Important Implementation Gaps (Current)
These are the biggest differences between intended team management behavior and the code that currently runs.

1. Team creation authorization is missing in backend.
- File: `app/api/teams/route.ts`
- Any authenticated user can create a team if they provide valid data.
- There is no backend check that the requester is a founder, manager, or even a member of the provided company.

2. Team creation trusts `companyId` from the client.
- File: `app/api/teams/route.ts`
- The API inserts the provided `companyId` directly.
- It does not verify that the requester belongs to that company.

3. Team lead validation is incomplete.
- File: `app/api/teams/route.ts`
- The API only checks that `teamleadId` exists in `users`.
- It does not verify that the selected lead belongs to the same company.
- It does not verify that the selected lead actually has a valid team-lead-capable role.

4. The backend ignores custom slug input.
- File: `app/api/teams/route.ts`
- The API recomputes `slug` from `body.name`.
- User-entered slug changes in the create dialog are effectively discarded.

5. Create-team service expects the wrong success status.
- File: `services/teams-services.ts`
- It shows a success toast only when `response.status === 200`.
- The API returns `201`, so that branch never runs.

6. Team detail endpoint is not scoped to company membership.
- File: `app/api/teams/[id]/route.ts`
- Any authenticated user can fetch any team by id.
- There is no check that the user belongs to the same company or the same team.

7. Team delete authorization is based on global user role only.
- File: `app/api/teams/[id]/route.ts`
- It checks `auth.user.role` instead of company membership role or team-specific authority.
- It also does not verify that the requester belongs to the target team's company.

8. Team member add authorization is incomplete.
- File: `app/api/teams/members/route.ts`
- The API verifies same-company membership, but it does not verify that the requester has permission to add members.
- Any authenticated company member can add members to any team in that company.

9. Team member search authorization is also incomplete.
- File: `app/api/teams/members/route.ts`
- Search is limited to the requester's company, which is good.
- But there is still no role-based permission check before searching potential members for assignment.

10. Team member delete authorization is based on global role only.
- File: `app/api/teams/members/[id]/route.ts`
- It checks `auth.user.role` instead of requester membership in the target company/team.
- A founder or manager from another context could pass the role check without explicit team/company validation.

11. The dashboard uses global session role as current team role.
- File: `app/teams/[teamId]/dashboard/page.tsx`
- `currentUserRole` comes from `session.user.role`.
- UI actions are decided from global role, not from the user's role inside this specific team.

12. Team role naming is inconsistent across files.
- Files: `app/teams/page.tsx`, `app/teams/[teamId]/dashboard/components/team-members-table.tsx`, `types/teams.ts`
- Some code uses `TEAMLEAD`.
- Some code uses `TEAM_LEAD`.
- This can break intended UI permission checks.

13. Add-member dialog does not use the selected role value.
- File: `app/teams/[teamId]/dashboard/components/add-member-dialog.tsx`
- The role select is disabled.
- On submit it sends `selectedUser.role`, not the local `role` state.
- The dialog currently cannot actually assign a new team role.

14. Member removal does not refresh the UI afterward.
- File: `app/teams/[teamId]/dashboard/page.tsx`
- After `deleteTeamMembers(memberId)`, the team data is not refetched.
- The UI can stay stale until a reload.

15. List page management actions are not connected yet.
- File: `app/teams/page.tsx`
- Edit, delete, and add-member actions on team cards are still TODO placeholders.

16. Team card navigation uses `redirect()` inside a client component click handler.
- File: `app/teams/page.tsx`
- That is not the intended client navigation pattern.
- The card also receives an `onClick` prop that is never used.

## Recommended Target Rules for Team Management
Use this as the intended policy baseline for future cleanup:

- Founder:
  - Can create, view, edit, and delete teams in their company.
  - Can add and remove team members.
- Manager:
  - Can create teams and manage team membership within their company.
  - Can delete teams only if that is part of your intended policy.
- Team Lead:
  - Can view and manage their own team's members if intended.
  - Should not rely on global user role for authorization.
- Employee:
  - View access only unless explicitly promoted inside team logic.

## Suggested Backend Enforcement Checklist
1. In `POST /api/teams`, resolve the requester's company from `company_members` instead of trusting client `companyId`.
2. Enforce create-team permissions in backend.
3. Verify selected `teamleadId` belongs to the same company.
4. Decide whether the selected lead must already be `TEAMLEAD` or can be promoted during creation.
5. Keep one canonical role format such as `TEAMLEAD` across UI, API, and DB.
6. In `GET /api/teams/[id]`, verify requester belongs to the same company or team.
7. In `POST /api/teams/members`, enforce role-based permission before insertion.
8. In `DELETE /api/teams/members/[id]`, verify requester belongs to the same company/team and has sufficient authority there.
9. Refetch or optimistically update dashboard state after member removal.
10. Implement edit/delete/list-page member actions fully or hide them until wired.

## Key Files
- `app/teams/page.tsx`
- `app/teams/[teamId]/dashboard/page.tsx`
- `app/teams/[teamId]/dashboard/components/add-member-dialog.tsx`
- `app/teams/[teamId]/dashboard/components/team-members-table.tsx`
- `app/teams/[teamId]/dashboard/components/team-info-card.tsx`
- `services/teams-services.ts`
- `hooks/use-teams.ts`
- `hooks/use-company.ts`
- `types/teams.ts`
- `validations/teams.validation.ts`
- `app/api/teams/route.ts`
- `app/api/teams/[id]/route.ts`
- `app/api/teams/members/route.ts`
- `app/api/teams/members/[id]/route.ts`
- `db/schemas/team/team.ts`
- `db/schemas/team/team_members.ts`
- `db/schemas/company/company-members.ts`
