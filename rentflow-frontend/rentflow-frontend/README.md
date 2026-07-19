# RentFlow Frontend — Admin & Customer Portals

A React + TypeScript frontend for RentFlow Solutions, with two role-based portals
(Administrator and Standard User) sitting on top of your Node.js/Express +
PostgreSQL/Prisma backend.

## Tech stack

| Layer            | Choice                                             |
| ----------------- | --------------------------------------------------- |
| Framework          | React 19 + Vite                                     |
| Language           | TypeScript                                          |
| Styling            | Tailwind CSS v4 (design tokens in `src/index.css`)   |
| Routing            | React Router v7                                     |
| State management   | React Context (`AuthContext`) — no external store needed for this scope |
| HTTP client         | Axios, `withCredentials: true` for the httpOnly JWT cookie |
| E2E testing         | Cypress                                             |

## Getting started

```bash
npm install
cp .env.example .env      # point VITE_API_BASE_URL at your Express server
npm run dev                # http://localhost:5173
```

By default `VITE_USE_MOCKS=true`, so the app runs standalone against in-memory
mock data (`src/services/mockData.ts`) — no backend required to explore it.

**Demo logins (mock mode):**
- Admin — `admin@rentflow.io` / `admin123`
- Customer — `devon@example.com` / `user123` (a second, suspended demo account: `maria@example.com` / `user123`)

### Connecting the real backend

Set `VITE_USE_MOCKS=false` in `.env`. Every function in `src/services/*.ts`
already has a real-API branch that calls `src/services/api.ts` (the shared
Axios instance) — nothing in the pages or components needs to change.

Expected backend contract (adjust paths to match your Express routes):

```
POST   /auth/login          { branch, identifier, password } -> { user, token }
POST   /auth/register        { name, email, password, role }  -> { user, token }
POST   /auth/logout
GET    /auth/session         -> User | 401
GET    /admin/users          -> User[]
PATCH  /admin/users/:id/role     { role }
PATCH  /admin/users/:id/status   { status }
DELETE /admin/users/:id
PATCH  /users/:id             { name?, email? }
GET    /rentals/mine         -> Rental[]
GET    /rentals/available    -> Rental[]
POST   /rentals/:id/request
GET    /admin/config/late-fees   -> LateFeePolicy
PUT    /admin/config/late-fees   LateFeePolicy
```

The backend is expected to set the JWT in an **httpOnly cookie** on login and
verify the user's role server-side on every protected endpoint — the frontend
RBAC below is a UX layer, not the security boundary.

## Project structure

```
src/
  components/
    common/     ProtectedRoute, RoleRoute, PortalLayout, StatCard, StatusBadge, spinners
    admin/      AdminLayout (staff sidebar/nav)
    user/       UserLayout (customer sidebar/nav)
  pages/
    Landing, Login, Register, Forbidden (403), NotFound (404)
    user/       UserDashboard, Profile, BrowseRentals, MyRentals
    admin/      AdminDashboard, UserManagement, Configuration, PlaceholderSection
  services/     api.ts (axios + interceptors), authService, userService, rentalService, mockData
  context/      AuthContext.tsx
  hooks/        useAuth.ts
  types/        shared TS interfaces
```

## Role-Based Access Control

- **`ProtectedRoute`** — redirects unauthenticated visitors to `/login`, preserving
  the intended destination.
- **`RoleRoute`** — wraps `ProtectedRoute` and additionally checks `user.role`
  against an allow-list. A signed-in Standard User hitting an admin-only route
  is sent to `/403` (not silently redirected to their own dashboard), so the
  "no access" signal is explicit.
- **Global 401/403 handling** — `src/services/api.ts` exposes
  `registerAuthErrorHandlers`, wired up once in `AuthContext`. Any Axios call
  anywhere in the app that gets a 401 clears the session and redirects to
  `/login`; a 403 redirects to `/403`. Individual components never need their
  own try/catch for this.

## Testing

Every interactive element carries a `data-testid` (form fields, nav links,
buttons, table rows) plus standard ARIA labeling, so tests don't rely on CSS
selectors or text content that's likely to change.

```bash
npm run dev          # in one terminal
npm run cy:open       # interactive runner, in another
# or, headless end-to-end in one command:
npm run e2e
```

Two starter specs are included under `cypress/e2e/`:

- `admin-auth.cy.ts` — admin login, navigation into User Management and
  Configuration, editing the late-fee rate and checking the live policy
  preview, and confirming unauthenticated visitors are bounced to `/login`.
- `user-auth.cy.ts` — customer login, browsing/requesting a rental, and
  confirming a signed-in customer is redirected to `/403` when visiting an
  admin-only route.

A shared `cy.loginAs('admin' | 'user')` command lives in
`cypress/support/e2e.ts` — reuse it in new specs instead of repeating the
login form fill-in.

## Notes

- No `localStorage`/`sessionStorage` is used anywhere; session state is a
  React Context value backed by the httpOnly cookie your Express server sets.
- `npm run build` type-checks (`tsc -b`) before bundling, so CI will fail
  fast on type errors.
