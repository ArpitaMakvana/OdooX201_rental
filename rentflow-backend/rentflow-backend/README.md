# RentFlow API

A production-ready Express + Prisma (PostgreSQL) REST API for **RentFlow**,
a multi-branch equipment rental management system. Built to match the
bundled `rentflow-frontend` (Admin console + Standard User portal) exactly
— every endpoint, payload shape, and status code below mirrors what
`src/services/*.ts` in that frontend already calls.

## Stack

- **Node.js / Express** — HTTP layer
- **PostgreSQL / Prisma ORM** — data layer
- **JWT in an httpOnly cookie** — session auth (never touches
  `localStorage`, matching `services/api.ts`'s `withCredentials: true`)
- **Zod** — request validation
- **bcryptjs** — password hashing
- **helmet, cors, express-rate-limit** — security headers, CORS, brute-force throttling
- **Jest + Supertest + jest-mock-extended** — unit/integration tests with a mocked Prisma client (no live DB required to run the suite)

## Project layout

```
src/
  config/        env validation, Prisma client singleton
  constants/      shared domain constants
  controllers/    thin HTTP handlers — parse req, call a service, shape the response
  dto/            maps Prisma rows -> the exact JSON shapes the frontend expects
  middleware/     protect / restrictTo, Zod validation, rate limiting, global error handler
  routes/         one file per resource
  services/       all business logic, fully decoupled from req/res
  utils/          AppError, catchAsync, JWT + cookie helpers
  app.js          Express app assembly (no listen())
  server.js       boots the app, connects Prisma, graceful shutdown
prisma/
  schema.prisma
  seed.js          seeds branches/users/items/rentals mirroring the frontend's mock data
tests/
  unit/            service-level tests against a mocked Prisma client
  integration/     supertest against the real Express app
  mocks/           shared deep-mocked PrismaClient
```

## Getting started

```bash
cp .env.example .env      # then edit DATABASE_URL / JWT_SECRET
npm install
npm run prisma:migrate    # creates tables from schema.prisma
npm run seed              # loads demo branches/users/items/rentals
npm run dev                # http://localhost:4000
```

Point the frontend at this API by setting, in `rentflow-frontend/.env`:

```
VITE_API_BASE_URL=http://localhost:4000/api
VITE_USE_MOCKS=false
```

### Demo accounts (from `prisma/seed.js`)

| Branch        | Email               | Password  | Role  |
|---------------|----------------------|-----------|-------|
| `main-branch` | admin@rentflow.io    | admin123  | admin |
| `gandhinagar` | devon@example.com    | user123   | user  |
| `ahmedabad`   | maria@example.com    | user123   | user (suspended) |
| `main-branch` | tom@example.com      | user123   | user  |

## Running tests

```bash
npm test
```

No PostgreSQL instance is required — every unit and integration test
mocks `src/config/prisma.js` with a deep Jest mock (`jest-mock-extended`),
so the suite runs anywhere Node runs.

## API reference

All routes are prefixed with `/api`. Authenticated routes read the JWT
from the `rentflow_token` httpOnly cookie (a `Bearer` header also works,
useful for non-browser clients).

### Auth — `/api/auth`

| Method | Path        | Auth | Body                                        | Notes |
|--------|-------------|------|----------------------------------------------|-------|
| POST   | `/register` | none | `{ name, email, password }`                  | `role` in the body is accepted but always forced to `user` server-side |
| POST   | `/login`    | none | `{ branch, identifier, password }`           | `identifier` is email or user id; branch must match the account's home branch |
| POST   | `/logout`   | none | —                                              | clears the auth cookie |
| GET    | `/session`  | any  | —                                              | re-hydrates the frontend's `AuthContext` on page load |

### Users — `/api/users`

| Method | Path   | Auth        | Body                        | Notes |
|--------|--------|-------------|------------------------------|-------|
| PATCH  | `/:id` | self\|admin | `{ name?, email? }`          | a user may only edit their own profile unless they're an admin |

### Admin — `/api/admin` (role: `admin` only)

| Method | Path                    | Body                                                        |
|--------|-------------------------|--------------------------------------------------------------|
| GET    | `/users`                | — |
| PATCH  | `/users/:id/role`       | `{ role: 'admin' \| 'user' }` |
| PATCH  | `/users/:id/status`     | `{ status: 'active' \| 'suspended' \| 'pending' }` — suspending immediately invalidates that user's active session |
| DELETE | `/users/:id`            | — (cascades their rental history) |
| GET    | `/config/late-fees`     | — |
| PUT    | `/config/late-fees`     | full `LateFeePolicy` object |

An admin can never change their own role/status or delete their own
account (prevents accidental admin lockout).

### Rentals — `/api/rentals`

| Method | Path              | Auth        | Notes |
|--------|-------------------|-------------|-------|
| GET    | `/mine`           | any         | For a `user`: their own booking history. For an `admin`: **every** rental system-wide — see compatibility note below. |
| GET    | `/available`      | `user` only | Bookable inventory (`Item`s) at the caller's home branch |
| POST   | `/:itemId/request`| `user` only | Reserves an item if it isn't already checked out |

**Compatibility note:** the bundled `AdminDashboard.tsx` calls
`rentalService.listMine()` to source its "rentals in flight" / "overdue"
stats — admins don't have personal rentals of their own, so `GET
/rentals/mine` deliberately returns the full system-wide list for an
admin caller rather than an empty array. See the docstring on
`rentalService.listMine` in `src/services/rental.service.js`.

**Compatibility note on `/available` and `/:itemId/request`:** the
frontend's `Rental` type has no "available" status — it only checks
`status === 'reserved'` to disable the request button. So these two
endpoints report inventory using the *item's* id (not a transaction id)
and use `status: 'returned'` to mean "free to book right now". Full
reasoning is documented above `toBookableItemDTO` in
`src/dto/rental.dto.js`.

## Security notes

- Passwords hashed with bcrypt (cost factor 12), never returned in any response.
- JWT lives only in an httpOnly, `sameSite` cookie — immune to XSS-based token theft.
- `User.tokenVersion` lets an admin action (suspension) invalidate a user's
  existing session immediately, without a server-side session store.
- `helmet` sets standard security headers; `cors` is locked to `CORS_ORIGIN`.
- `express-rate-limit` throttles `/auth/register` and `/auth/login`.
- All input is validated with Zod before it reaches a controller.
- The global error handler hides stack traces and internal error
  messages once `NODE_ENV=production`.
