# Authentication Features

## Overview
This project uses cookie-based JWT authentication with:
- `accessToken` (short-lived, 15 minutes)
- `refreshToken` (long-lived, 7 days)

Auth is enforced primarily in `proxy.ts`, which protects non-public routes and can mint a new access token when the refresh token is still valid.

## Implemented Features

### 1. User Signup
File: `app/api/auth/signup/route.ts`
- Validates payload with Zod (`validations/auth.validation.ts`)
- Enforces password policy (length, uppercase, lowercase, number, special character)
- Checks existing user by email
- Hashes password with `bcryptjs`
- Stores user in database

Client signup UI:
- `components/signup-form.tsx`
- Includes confirm-password check and client-side password rule checks before API call

### 2. User Login
File: `app/api/auth/login/route.ts`
- Validates login input with Zod
- Finds user by email
- Verifies password with `bcrypt.compare`
- Creates JWT access and refresh tokens
- Stores both tokens in `httpOnly` cookies

Client login UI:
- `components/login-form.tsx`
- Calls `loginUser()` then `getUserData()` from `services/auth-services.ts`
- Shows success/error toasts

### 3. Current User Endpoint (`/api/auth/me`)
Files:
- `app/api/auth/me/route.ts`
- `lib/withAuth.ts`
- `lib/auth.ts`

Behavior:
- Reads `accessToken` from request cookies
- Verifies JWT signature using `JWT_ACCESS_SECRET`
- Returns authenticated user payload when valid
- Returns `401` when missing/invalid

### 4. Route Protection and Silent Refresh in Proxy
File: `proxy.ts`

Behavior:
- Allows public auth routes (`/login`, `/register`, `/forgot-password`, `/reset-password`)
- Redirects unauthenticated users to `/login` for protected routes
- Redirects authenticated users away from auth-only routes to `/dashboard`
- Verifies `accessToken` directly with `jose`
- If access token is expired but refresh token is valid, creates a fresh access token and sets cookie
- If refresh token is invalid/expired, clears cookies and forces login

### 5. Client Auth Initialization and State
Files:
- `hooks/use-auth-init.ts`
- `components/auth-initializer.tsx`
- `store/auth-store.ts`

Behavior:
- On app init, fetches `/api/auth/me`
- Stores authenticated user in Zustand store
- Provides `setUser` and `clearUser`

### 6. Role-Ready Model
Files:
- `types/role.ts`
- `types/user.ts`

Features:
- Central role constants (`USER`, `RECRUITER`, `FOUNDER`, `SUPERADMIN`)
- Role hierarchy helpers
- Permission group definitions for future authorization checks

## Security Characteristics
- Passwords are hashed (`bcryptjs`)
- Tokens are stored in `httpOnly` cookies (not directly readable by JS)
- `secure` cookie flag is enabled in production
- Token expiration is enforced
- Middleware-like protection is centralized in `proxy.ts`

## Important Consistency Notes
1. Route naming mismatch:
- UI uses `/signup`, but proxy public/auth-only lists include `/register`.

2. Secret name mismatch:
- `proxy.ts` uses `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET`
- `app/api/auth/refresh/route.ts` uses `ACCESS_TOKEN_SECRET` / `REFRESH_TOKEN_SECRET`

3. Cookie policy mismatch:
- Login route sets `sameSite: "strict"`
- Proxy refresh path sets `sameSite: "lax"`

4. Login UX flow is incomplete:
- `LoginForm` fetches user after login but currently does not navigate or store user there.

5. No logout endpoint yet:
- There is no API route shown that clears auth cookies explicitly.

## Environment Variables In Use
From `.env`:
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `NODE_ENV`
- `NEXT_PUBLIC_API_URL`
- `DATABASE_URL`

