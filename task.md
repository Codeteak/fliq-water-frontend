# WaterFlow Frontend Implementation Tasks

This task list is based on `customer.md` backend API documentation.

Backend base path: `/api`  
Frontend base URL (dev): `http://localhost:3002`  
Backend URL (dev): `http://localhost:3000`

---

## Phase 0 - Foundation and Setup

- [x] Verify env values in `.env.local`
  - `NEXT_PUBLIC_API_URL=http://localhost:3000`
  - `AUTH_URL=http://localhost:3002`
  - `AUTH_SECRET=<strong-secret>`
- [x] Confirm frontend runs on `3002` and backend on `3000`.
- [x] Add API constants and endpoint map in `src/lib/constants.ts`.
- [x] Add shared error parser utility in `src/lib/error.ts`.
- [x] Add loading state store (global spinner/toast triggers) in `src/store/ui.store.ts`.

Deliverable:
- Stable base app, all API calls point to `NEXT_PUBLIC_API_URL`.

---

## Phase 1 - Type System and Schemas

- [x] Create domain types:
  - `src/types/auth.ts`
  - `src/types/address.ts`
  - `src/types/deposit.ts`
  - `src/types/order.ts`
- [x] Add Zod schemas (request + response) under `src/features/*/schemas.ts`.
- [x] Add API DTO mappers to convert backend shape into UI-friendly model.

Required API contracts:
- Auth: register/login/refresh/logout responses with `accessToken`, `refreshToken`, `expiresIn`, `user`.
- Product: `price`, `depositPerCan`, `orderValuePerCan`, `photoUrl`, `photoUrls`, `stock`, `category`.
- Deposit: public config + wallet balance/top-up.
- Orders: quote breakdown + create/list/track payloads.

Deliverable:
- Type-safe request/response layer without `any`.

---

## Phase 2 - API Client and Token Lifecycle

- [x] Upgrade `src/lib/api.ts`:
  - attach `Authorization: Bearer <accessToken>` for protected routes.
  - handle `401` via refresh token flow.
  - retry original request once after successful refresh.
- [x] Add token storage helper `src/lib/auth-token.ts`:
  - get/set/clear access + refresh tokens.
- [x] Add refresh API call to `POST /api/auth/refresh`.
- [x] Add logout cleanup flow using `POST /api/auth/logout`.
- [x] Add normalized API error object shape.

Protected APIs to auto-attach token:
- `/api/addresses/*`
- `/api/orders/*`
- `/api/deposits/wallet/me*`

Deliverable:
- Seamless authenticated API usage with automatic refresh.

---

## Phase 3 - Authentication UX (OTP + Password)

- [x] Build auth pages:
  - `src/app/auth/login/page.tsx`
  - `src/app/auth/register/page.tsx`
- [x] Register flow (`POST /api/auth/register`):
  - step 1: send phone (+ optional name/password), show OTP input.
  - step 2: submit same payload + OTP, save tokens, redirect.
- [x] Login flow (`POST /api/auth/login`):
  - mode toggle: `phone+password` or `phone+otp`.
- [x] Integrate with NextAuth session or custom auth context (pick one and keep consistent).
- [x] Add logout action in header/profile menu.
- [x] Add route guard behavior for protected pages.

Validation rules:
- phone = 10 digits
- password min 6
- otp = 6 digits

Deliverable:
- End-to-end auth flow working with backend.

---

## Phase 4 - Products and Catalog

- [x] Build products API module `src/features/products/api.ts`:
  - `GET /api/products`
  - `GET /api/products/:id`
- [x] Update `ProductCard` to show:
  - price
  - deposit per can
  - order value per can
  - image from `photoUrl`/`photoUrls`
- [x] Build product detail page `src/app/product/[slug]/page.tsx` with image gallery.
- [x] Add category filter UI (20L, 1L, 500ml, subscription if mapped).
- [x] Add loading and empty states for products list.

Deliverable:
- Product listing and detail connected to real backend data.

---

## Phase 5 - Address Management

- [x] Build address feature module:
  - `GET /api/addresses`
  - `POST /api/addresses`
  - `PATCH /api/addresses/:id`
- [x] Build account address UI:
  - list addresses
  - add address form
  - edit address form
  - default/select behavior for checkout
- [x] Ensure checkout cannot proceed without selected `addressId`.

Deliverable:
- Address CRUD fully integrated and reusable in checkout.

---

## Phase 6 - Deposit Experience

- [x] Public deposit config on home/checkout:
  - `GET /api/deposits/public-config`
  - show `perCanAmount`, promo tiers, active window.
- [x] Wallet module:
  - `GET /api/deposits/wallet/me`
  - `POST /api/deposits/wallet/me/top-up`
- [x] Add top-up modal with amount input and success/error states.

Deliverable:
- User can view deposit policy and manage wallet balance.

---

## Phase 7 - Cart and Quote-first Checkout

- [x] Extend cart store to include:
  - productId
  - quantity
  - delivery `timeSlot`
  - selected `addressId`
  - payment method
- [x] On checkout preview call `POST /api/orders/quote`.
- [x] Render quote breakdown:
  - `itemsSubtotal`
  - `depositBase`
  - `depositDiscount`
  - `depositCharge`
  - `totalAmount`
  - `walletBalance`
  - `shortfall`
- [x] If `shortfall > 0`, block place order and prompt top-up.

Deliverable:
- Quote-first checkout with correct financial visibility.

---

## Phase 8 - Place Order and Track

- [x] Place order via `POST /api/orders` (same body as quote).
- [x] Orders list page:
  - `GET /api/orders/my`
- [x] Order tracking page:
  - `GET /api/orders/:id/track`
- [x] Show status timeline:
  - `RECEIVED -> CONFIRMED -> PACKED -> DISPATCHED -> DELIVERED`
  - handle `CANCELLED`

Deliverable:
- Complete post-purchase flow with history and tracking.

---

## Phase 9 - UI/UX Quality and Validation

- [x] Add skeleton loaders for product grid, checkout summary, orders list.
- [x] Add robust empty/error states on all API-driven screens.
- [x] Add mobile-first polish:
  - sticky checkout summary
  - cart drawer accessibility
  - responsive 5-column layout fallback
- [ ] Ensure all forms have client + server validation feedback.

Deliverable:
- Production-quality customer UX.

---

## Phase 10 - Testing and Reliability

- [ ] Unit tests:
  - auth schema validation
  - token refresh logic
  - quote total rendering logic
- [ ] Integration tests (RTL + MSW):
  - login success/failure
  - register OTP step flow
  - checkout quote + top-up + order placement
- [ ] Add API mocks under `src/tests/mocks`.

Deliverable:
- Confident release with critical path test coverage.

---

## Phase 11 - Deployment and Runtime Safety

- [ ] Add staging/prod env files in deployment platform.
- [ ] Verify CORS/cookie/token behavior against deployed backend.
- [ ] Add observability:
  - request error logging
  - user-friendly fallback messages
- [ ] Final smoke checklist:
  - register/login
  - browse products
  - add/edit address
  - quote
  - top-up (if shortfall)
  - place order
  - track order

Deliverable:
- Deployment-ready frontend integrated with backend APIs.

---

## Endpoint-to-Feature Map (Quick Reference)

- Auth
  - `POST /api/auth/register` -> register + OTP verify
  - `POST /api/auth/login` -> login
  - `POST /api/auth/refresh` -> refresh token
  - `POST /api/auth/logout` -> logout
- Products
  - `GET /api/products` -> listing
  - `GET /api/products/:id` -> detail
- Addresses
  - `GET /api/addresses` -> list
  - `POST /api/addresses` -> add
  - `PATCH /api/addresses/:id` -> edit
- Deposits
  - `GET /api/deposits/public-config` -> deposit policy
  - `GET /api/deposits/wallet/me` -> wallet balance
  - `POST /api/deposits/wallet/me/top-up` -> wallet top-up
- Orders
  - `POST /api/orders/quote` -> pre-checkout quote
  - `POST /api/orders` -> place order
  - `GET /api/orders/my` -> order history
  - `GET /api/orders/:id/track` -> tracking

---

## Suggested Execution Order (Short)

1. Types + API client/token refresh  
2. Auth (register/login/logout)  
3. Products + product detail  
4. Address CRUD  
5. Deposit config + wallet top-up  
6. Quote-first checkout  
7. Place order + tracking  
8. Tests + deployment hardening
