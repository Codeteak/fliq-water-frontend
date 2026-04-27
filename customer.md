# Customer Website API Details

This file documents the APIs needed for the **customer website**: authentication, product listing, address management, deposit details, and order flow.

Base URL prefix: ` /api `

Swagger: ` /api/docs `

---

## 1) Authentication

### 1.1 Register customer (OTP flow)

- **POST** ` /api/auth/register `
- Used in 2 steps:
  1. Send phone (+ optional name/password) to request OTP
  2. Send same phone + `otp` to complete registration

Request (step 1):

```json
{
  "phone": "9876543210",
  "name": "John",
  "password": "secret123"
}
```

Response (step 1):

```json
{
  "sent": true,
  "message": "OTP sent to your phone"
}
```

Request (step 2):

```json
{
  "phone": "9876543210",
  "name": "John",
  "password": "secret123",
  "otp": "123456"
}
```

Response (success):

```json
{
  "accessToken": "jwt",
  "refreshToken": "jwt",
  "expiresIn": 900,
  "user": {
    "id": "user_id",
    "phone": "9876543210",
    "name": "John",
    "role": "customer"
  }
}
```

Validation rules:
- `phone`: 10 digits
- `password`: min 6 chars (optional)
- `otp`: 6 digits (required to finish registration)

---

### 1.2 Login

- **POST** ` /api/auth/login `
- Login via:
  - `phone + password`, or
  - `phone + otp`

Request:

```json
{
  "phone": "9876543210",
  "password": "secret123"
}
```

or

```json
{
  "phone": "9876543210",
  "otp": "123456"
}
```

Response:

```json
{
  "accessToken": "jwt",
  "refreshToken": "jwt",
  "expiresIn": 900,
  "user": {
    "id": "user_id",
    "phone": "9876543210",
    "name": "John",
    "role": "customer"
  }
}
```

---

### 1.3 Refresh token

- **POST** ` /api/auth/refresh `

Request:

```json
{
  "refreshToken": "jwt_refresh_token"
}
```

Response: same shape as login (new access + refresh tokens).

---

### 1.4 Logout

- **POST** ` /api/auth/logout `

Request:

```json
{
  "refreshToken": "jwt_refresh_token"
}
```

Response:

```json
{
  "success": true
}
```

---

## 2) Auth Header for protected endpoints

For protected APIs, send:

`Authorization: Bearer <accessToken>`

Protected groups for customer website:
- ` /api/addresses/* `
- ` /api/orders/* `
- ` /api/deposits/wallet/me* `

---

## 3) Products (public listing for website)

### 3.1 List products
- **GET** ` /api/products `

### 3.2 Product detail
- **GET** ` /api/products/:id `

Response fields include:
- `price`
- `depositPerCan`
- `orderValuePerCan` (`price + depositPerCan`)
- `photoUrl`
- `photoUrls` (multiple images)
- `stock`, `category`, `isActive`

Example:

```json
{
  "id": "prod_1",
  "name": "20L Water Can",
  "price": 120,
  "depositPerCan": 50,
  "orderValuePerCan": 170,
  "photoUrl": "https://cdn/img1.jpg",
  "photoUrls": ["https://cdn/img1.jpg", "https://cdn/img2.jpg"],
  "stock": 40,
  "category": "20L",
  "isActive": true,
  "createdAt": "2026-03-26T06:00:00.000Z",
  "updatedAt": "2026-03-26T06:00:00.000Z"
}
```

---

## 4) Addresses (customer)

### 4.1 List my addresses
- **GET** ` /api/addresses `

### 4.2 Add address
- **POST** ` /api/addresses `

### 4.3 Update address
- **PATCH** ` /api/addresses/:id `

These are required for order placement because `addressId` is mandatory in order APIs.

---

## 5) Deposits (customer website)

### 5.1 Public deposit config (no login)
- **GET** ` /api/deposits/public-config `

Used by website to show deposit policy and active promo tiers.

Example:

```json
{
  "perCanAmount": 50,
  "promoActive": true,
  "promoStartsAt": "2026-03-01T00:00:00.000Z",
  "promoEndsAt": "2026-03-31T23:59:59.999Z",
  "tiers": [
    { "minQty": 3, "discountPercent": 5 },
    { "minQty": 5, "discountPercent": 10 }
  ]
}
```

### 5.2 My deposit wallet balance
- **GET** ` /api/deposits/wallet/me ` (auth required)

Response:

```json
{
  "balance": 300
}
```

### 5.3 Top-up my wallet
- **POST** ` /api/deposits/wallet/me/top-up ` (auth required)

Request:

```json
{
  "amount": 200,
  "note": "UPI top-up"
}
```

Response:

```json
{
  "balance": 500
}
```

---

## 6) Orders (customer)

### 6.1 Quote order before placing
- **POST** ` /api/orders/quote ` (auth required)
- Same request body as create order.

Request:

```json
{
  "addressId": "addr_1",
  "timeSlot": "10:00-12:00",
  "paymentMethod": "COD",
  "items": [
    { "productId": "prod_1", "quantity": 2 },
    { "productId": "prod_2", "quantity": 1 }
  ]
}
```

Response:

```json
{
  "itemsSubtotal": 340,
  "depositBase": 150,
  "depositDiscount": 15,
  "depositCharge": 135,
  "totalAmount": 475,
  "walletBalance": 200,
  "shortfall": 0,
  "discountPercent": 10,
  "quantity": 3
}
```

### 6.2 Create order
- **POST** ` /api/orders ` (auth required)
- Uses same request body as quote.

Important returned fields:
- `totalAmount`
- `depositBase`
- `depositDiscount`
- `depositCharge`
- `depositRefunded` (boolean)
- items, address, status, timestamps

### 6.3 List my orders
- **GET** ` /api/orders/my ` (auth required)

### 6.4 Track one order
- **GET** ` /api/orders/:id/track ` (auth required)

Order status flow:
- `RECEIVED -> CONFIRMED -> PACKED -> DISPATCHED -> DELIVERED`
- Can become `CANCELLED` based on admin actions/rules

---

## 7) Deposit + Order Logic (business logic)

For each order:

1. Calculate total item quantity from cart.
2. `depositBase = perCanAmount * quantity`
3. If promo is active and in valid time window, apply best matching tier:
   - Example tiers:
     - `minQty 3 => 5%`
     - `minQty 5 => 10%`
4. `depositDiscount = depositBase * discountPercent / 100`
5. `depositCharge = depositBase - depositDiscount`
6. Check customer wallet balance:
   - if insufficient, order is rejected with shortfall message
7. Final order value:
   - `totalAmount = itemsSubtotal + depositCharge`
8. On successful order:
   - wallet is debited by `depositCharge`
   - deposit transaction is recorded

Can-return refund:
- Refund is done by admin/owner endpoint (`/api/admin/orders/:id/return-cans`)
- refunded amount is credited back to customer wallet
- each order deposit can be refunded once

---

## 8) Frontend integration checklist (customer website)

1. Implement register/login/logout/refresh token flow.
2. Store `accessToken` and `refreshToken` securely.
3. Show products from ` /api/products ` including:
   - `price`, `depositPerCan`, `orderValuePerCan`, images
4. Show deposit policy from ` /api/deposits/public-config `.
5. Before order placement:
   - call ` /api/orders/quote `
   - show breakdown to user (subtotal, deposit, discount, total)
6. If wallet shortfall exists:
   - prompt top-up via ` /api/deposits/wallet/me/top-up `
7. Place order with ` /api/orders `
8. Show order history and tracking via ` /api/orders/my ` and ` /api/orders/:id/track `

