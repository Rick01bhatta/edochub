# EdocHub — Auth API Documentation

This document describes the authentication-related HTTP endpoints available in the EdocHub backend. It includes request method/URL, headers, sample bodies, sample responses, errors, and notes for frontend developers to integrate the API.

Base URL (development):

- http://localhost:5500/api/auth

Content-Type used for all endpoints below: `application/json`

---

## Endpoints

### 1) Register
- Method: POST
- URL: `/api/auth/register`
- Purpose: Create a new user account and return an auth token
- Headers:
  - `Content-Type: application/json`

Request body (JSON):

```json
{
  "name": "Sayan Banerjee",
  "email": "banerjeesayan554@gmail.com",
  "password": "yourPassword123"
}
```

Success response (201 Created):

```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "<userId>",
      "name": "Sayan Banerjee",
      "email": "banerjeesayan554@gmail.com",
      "createdAt": "2025-11-04T...",
      "updatedAt": "2025-11-04T..."
    },
    "token": "<jwt_token>"
  }
}
```

Error examples:
- Email already in use → 400

```json
{
  "success": false,
  "error": "Email already in use"
}
```

Notes:
- The password is hashed by the backend before saving.
- Use the returned `token` for authenticated requests (if applicable) via `Authorization: Bearer <token>`.

---

### 2) Login
- Method: POST
- URL: `/api/auth/login`
- Purpose: Authenticate and obtain an auth token
- Headers:
  - `Content-Type: application/json`

Request body (JSON):

```json
{
  "email": "banerjeesayan554@gmail.com",
  "password": "yourPassword123"
}
```

Success response (200 OK):

```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "<userId>",
      "name": "...",
      "email": "..."
    },
    "token": "<jwt_token>"
  }
}
```

Error example (401 Unauthorized):

```json
{
  "success": false,
  "error": "Invalid credentials"
}
```

Notes:
- The backend expects the exact password used when registering or after a password reset.

---

### 3) Request Password Reset (send OTP)
- Method: POST
- URL: `/api/auth/forgot-password`
- Purpose: Generate a short numeric OTP and email it to the user
- Headers:
  - `Content-Type: application/json`

Request body (JSON):

```json
{
  "email": "banerjeesayan554@gmail.com"
}
```

Success response (200 OK):

```json
{
  "success": true,
  "data": { "message": "OTP sent to email" }
}
```

Notes:
- OTP is a 6-digit code that expires in 10 minutes.
- In development, if SMTP isn't configured, OTPs may be logged to server console. Check server logs when testing locally.
- SMTP configuration is read from your `.env` (see "Environment variables" below).

---

### 4) Verify OTP
- Method: POST
- URL: `/api/auth/verify-otp`
- Purpose: Verify the numeric OTP sent to user's email and return a short-lived reset token
- Headers:
  - `Content-Type: application/json`

Request body (JSON):

```json
{
  "email": "banerjeesayan554@gmail.com",
  "otp": "123456"
}
```

Success response (200 OK):

```json
{
  "success": true,
  "data": {
    "resetToken": "<short_lived_reset_jwt>"
  }
}
```

Error examples:
- Invalid/expired OTP → 400

```json
{
  "success": false,
  "error": "OTP is invalid or has expired"
}
```

Notes:
- The returned `resetToken` is a JWT typed `reset` and valid for ~15 minutes. Use this token to call `/reset-password`.

---

### 5) Reset Password (use reset token)
- Method: POST
- URL: `/api/auth/reset-password`
- Purpose: Set a new password using the reset token obtained from verify-otp
- Headers:
  - `Content-Type: application/json`

Request body (JSON):

```json
{
  "token": "<resetToken_from_verify_otp>",
  "newPassword": "newSecurePassword123"
}
```

Success response (200 OK):

```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "<userId>",
      "name": "...",
      "email": "..."
    },
    "token": "<jwt_token>"  // new auth token
  }
}
```

Error examples:
- Invalid/expired reset token → 400
- User not found → 404

Notes:
- The backend will set the `newPassword` on the user and call `save()` so the same pre-save hashing runs as during registration. This ensures login works with the new password.
- After a successful reset the stored OTP and expiry are cleared.

---

## Request / fetch examples (frontend)

- Using `fetch` (example for login):

```js
const res = await fetch('http://localhost:5500/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'banerjeesayan554@gmail.com', password: 'yourPassword' })
});
const json = await res.json();
if (!res.ok) throw new Error(json.error || 'Login failed');
// use json.data.token
```

- Using `fetch` (example to reset password):

```js
const res = await fetch('http://localhost:5500/api/auth/reset-password', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ token: '<resetToken>', newPassword: 'newPass123' })
});
const json = await res.json();
```

---

## Headers summary
- `Content-Type: application/json` — required for all request bodies described here.
- `Authorization: Bearer <token>` — returned token can be used for protected routes (the auth routes documented do not require `Authorization` for these actions).

---

## Environment variables (important for email + auth)
Make sure the following are present in your `.env` / `.env.development.local`:

```
NODE_ENV=development
PORT=5500
MONGODB_URI=<your-mongo-uri>
JWT_SECRET=<your_jwt_secret>
JWT_EXPIRES_IN=7d

# SMTP (for sending OTP emails)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=you@example.com
SMTP_PASS=<app-password-or-smtp-pass>
SMTP_FROM=you@example.com
SMTP_FROM_NAME=EdocHub
```

Notes:
- For Gmail use, enable 2FA and create an App Password for SMTP, then set it as `SMTP_PASS`.
- In development, if email sending fails the OTP may be printed to the server logs.

---

## Token lifetimes and security
- OTP expiry: 10 minutes
- Reset JWT expiry: ~15 minutes
- Auth JWT expiry: configured via `JWT_EXPIRES_IN` (default `7d` in `.env`)

Security notes for frontend:
- Do not store the JWT in localStorage without considering XSS risk. Prefer HttpOnly cookies when possible.
- Always use HTTPS in production.

---

## Error format
If the server returns an error it will generally be in this form (status code varies):

```json
{
  "success": false,
  "error": "Error message"
}
```

---

## Quick test checklist (frontend developer)
1. Start backend server: `npm run dev` (confirm console shows server running and DB connected)
2. Register a new user using `/register` and confirm you get a token
3. Login with the same credentials using `/login`
4. Request password reset using `/forgot-password` and get the OTP (via email or server logs)
5. Verify OTP with `/verify-otp` to get a reset token
6. Reset password using `/reset-password` and then login with the new password

---

If you want I can also add a tiny JS test script in `scripts/` that runs the full flow (register → login → forgot → verify → reset → login) to help automate frontend integration testing. Open an issue or request and I will add it.

---

Happy integrating — if anything in the real responses does not match this doc, paste the actual server response and I'll update the README accordingly.
