# Interviewer

This is a Next.js application for company management, hiring workflows, and role-based access control.

## Project Docs

- [Authentication Features](./AUTHENTICATION_FEATURES.md)
- [Company Creation, Hiring, and RBAC](./COMPANY_HIRING_RBAC.md)

## Core Features

- Cookie-based JWT auth (access + refresh tokens)
- Company creation and membership mapping
- Invite-based hiring flow (invite, accept, join)
- Role-based access for Founder, Recruiter, Employee, and User

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the app by modifying files in `app/`. Changes auto-update in development.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
