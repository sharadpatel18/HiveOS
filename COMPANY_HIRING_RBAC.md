# Company Creation, Hiring Flow, and Role-Based Access (Current Implementation)

## Overview
This document explains how company creation, member hiring (invite/join), and role-based access currently work in this codebase, based on the implemented API and UI logic.

## Role Model
Primary roles used across company features:
- `USER`
- `EMPLOYEE`
- `RECRUITER`
- `FOUNDER`
- `SUPERADMIN` (defined in role constants, not actively used in company APIs here)

Source: `types/role.ts`

## Company Creation Flow
Endpoint: `POST /api/company` (`app/api/company/route.ts`)

### What happens
1. Auth is required via `withAuth()`.
2. Request is validated with `companyValidation`.
3. It rejects duplicate `slug`.
4. It rejects creation if this user already owns a company (`company.userId = currentUserId`).
5. It creates a row in `company`.
6. It updates the creator's `users.role` to `FOUNDER`.
7. It creates a `company_members` row for the creator with:
- `role: FOUNDER`
- `hiredBy: creatorId`
8. Returns `201 Success`.

### Resulting state
- Company owner (`company.userId`) is the creator.
- Creator is also a member in `company_members` as `FOUNDER`.
- Global user role is promoted to `FOUNDER`.

## How Current Company Is Resolved for a User
Endpoint: `GET /api/company` (`app/api/company/route.ts`)

### Behavior
- Joins `company_members` with `company` by `companyId`.
- Filters by logged-in `company_members.userId`.
- Returns first match (`limit(1)`) including `memberRole`.
- Returns `null` if no company membership exists.

### Why this matters
UI derives effective role and company-scoped access from this payload (`memberRole` + `company.userId`).

## Hiring / Invite Flow
Hiring is implemented primarily as invite + accept.

### 1) Send invite
Endpoint: `POST /api/company/invite` (`app/api/company/invite/route.ts`)

Expected request:
- `companyId`
- `email`
- `role`

Current implemented steps:
1. Auth required.
2. Finds invited user by email in `users`.
3. Checks inviter is a company member.
4. Checks requested role is in `ROLE_GROUPS.CAN_INVITE_EMPLOYEES`.
5. Prevents duplicate invite with same company/email/role.
6. Creates `company_invites` row (`token`, `expiresAt`, `invitedBy`, etc.).
7. Sends email with invite link.

### 2) View invites for current user
Endpoint: `GET /api/company/invite`

- Returns invites where `company_invites.userId = auth.user.id`.
- Includes company details and inviter info.

### 3) Accept invite
Endpoint: `POST /api/company/invite/join` (`app/api/company/invite/join/route.ts`)

Expected request:
- `id` (invite id)
- `token`
- `role`

Current steps:
1. Auth required.
2. Validates request body.
3. Loads invite by `id`.
4. Verifies provided `token` matches invite token.
5. Marks invite status as `accepted`.
6. Inserts into `company_members` with invite company and `hiredBy = invitedBy`.

## Role-Based Access (UI)
Role-based visibility/locking is implemented in UI components.

### Sidebar (`components/app-sidebar.tsx`)
- `FOUNDER`: full company nav.
- `RECRUITER`: can access members/invite/applications; cannot post job/settings.
- `EMPLOYEE`: members only; invite/applications/job/settings locked.
- `USER`: company features mostly locked.

### Company page permissions (`app/company/page.tsx`)
`usePermissions()` currently maps:
- `canPostJob`: founder only
- `canInviteRecruiter`: founder only
- `canInviteEmployee`: founder or recruiter
- `canViewApplications`: founder or recruiter
- `canManageSettings`: founder only

### Members page hiring UI (`app/company/[companyId]/members/page.tsx`)
Assignable roles in invite dialog:
- Founder can assign: `RECRUITER`, `EMPLOYEE`
- Recruiter can assign: `EMPLOYEE`

## Important Implementation Gaps (Current)
These are significant differences between intended RBAC/hiring behavior and current enforcement.

1. Invite membership check is incorrect in backend.
- File: `app/api/company/invite/route.ts`
- Uses `eq(...) && eq(...)` instead of Drizzle `and(...)`.
- Effect: user-id check is not reliably enforced; condition collapses to companyId check.

2. Invite authorization checks target role, not inviter role.
- File: `app/api/company/invite/route.ts`
- `ROLE_GROUPS.CAN_INVITE_EMPLOYEES.includes(role)` checks invited role value.
- Effect: does not verify inviter's permissions properly.

3. Recruiter invite from backend is blocked by current rule.
- `CAN_INVITE_EMPLOYEES` only allows invited role values founder/recruiter? actually group is inviter roles, but code compares invited role.
- In practice, inviting `RECRUITER` is denied by backend.

4. Accept invite trusts role from client body.
- File: `app/api/company/invite/join/route.ts`
- Uses `role` from request instead of `requestInvite[0].role`.
- Effect: privilege escalation risk.

5. Accept invite does not verify invite ownership.
- No check that invite email/user matches logged-in user.

6. Accept invite does not enforce expiration/status checks.
- `expiresAt` exists but is not validated on join.
- Already-accepted/expired state checks are missing.

7. Members list endpoint has no company membership authorization.
- File: `app/api/company/members/[companyId]/route.ts`
- Any authenticated user can request members for any company id.

8. Direct member add endpoint can be misused.
- File: `app/api/company/members/route.ts`
- Any authenticated user can self-insert into a company by passing `companyId` and a valid `hiredBy` id.
- No role/company authorization check.

9. Invite UI token validation is not token-based.
- File: `app/company/invite/page.tsx`
- It fetches all user invites and picks first invite; URL token is not used to select invite.

10. Expiry messaging mismatch.
- UI says invite valid for 7 days.
- Backend sets `expiresAt` to 48 hours.

## Recommended Target Rules for Role-Based Hiring
Use this as the intended policy baseline:

- Founder:
  - Can invite recruiter and employee.
  - Can post jobs, view applications, manage settings.
- Recruiter:
  - Can invite employee only.
  - Can view applications.
  - Cannot manage company settings.
- Employee:
  - No hiring permissions.
  - View-only company access.
- User (non-member):
  - No company hiring permissions.

## Suggested Backend Enforcement Checklist
1. In invite API, verify inviter membership with `and(eq(userId), eq(companyId))`.
2. Resolve inviter role from `company_members` and enforce allowed target roles based on inviter role.
3. Validate invited user exists; return clear error if not.
4. Prevent inviting users already in `company_members`.
5. In join API, use role from invite record only (ignore client role input).
6. Verify invite belongs to logged-in user and is `PENDING` + not expired.
7. Reject duplicate membership gracefully.
8. Protect `GET /api/company/members/[companyId]` by membership check.
9. Restrict/remove direct `POST /api/company/members` unless it has strict RBAC.
10. Keep UI and backend role matrix identical from one shared source.

## Key Files
- `app/api/company/route.ts`
- `app/api/company/invite/route.ts`
- `app/api/company/invite/join/route.ts`
- `app/api/company/members/route.ts`
- `app/api/company/members/[companyId]/route.ts`
- `app/company/page.tsx`
- `app/company/[companyId]/members/page.tsx`
- `app/company/invite/page.tsx`
- `components/app-sidebar.tsx`
- `types/role.ts`
- `validations/company.validation.ts`
- `db/schemas/company.ts`
- `db/schemas/company-members.ts`
- `db/schemas/company-invites.ts`
