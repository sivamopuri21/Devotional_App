# Feature 1: API Contracts

## Base Configuration

### Base URL
```
Production: https://api.swadharmaparirakshna.com/v1
Staging:    https://api-staging.swadharmaparirakshna.com/v1
Local:      http://localhost:3000/api/v1
```

### Common Headers
```http
Content-Type: application/json
Accept: application/json
Authorization: Bearer <access_token>  # For authenticated endpoints
X-Request-ID: <uuid>                  # For request tracing
X-Client-Version: 1.0.0               # App version
X-Platform: android|ios|web           # Client platform
```

### Standard Response Format
```json
{
  "success": true,
  "data": { },
  "meta": {
    "requestId": "uuid",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

### Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": { },
    "field": "fieldName"  // For validation errors
  },
  "meta": {
    "requestId": "uuid",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

---

## Authentication APIs

### POST /auth/register
Register a new user account.

**Request:**
```json
{
  "email": "user@example.com",      // Optional if phone provided
  "phone": "+919876543210",          // Optional if email provided
  "password": "SecurePass123!",
  "role": "member",                  // member | provider
  "fullName": "Ramesh Kumar"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "userId": "uuid",
    "email": "user@example.com",
    "phone": "+919876543210",
    "role": "member",
    "status": "pending",
    "verificationRequired": true,
    "verificationChannel": "email"   // email | phone
  }
}
```

**Errors:**
| Code | Status | Description |
|------|--------|-------------|
| EMAIL_EXISTS | 409 | Email already registered |
| PHONE_EXISTS | 409 | Phone already registered |
| INVALID_PASSWORD | 400 | Password doesn't meet requirements |
| INVALID_PHONE | 400 | Invalid phone number format |

---

### POST /auth/verify-otp
Verify OTP for registration or login.

**Request:**
```json
{
  "contact": "user@example.com",     // Email or phone
  "otp": "123456",
  "purpose": "registration"          // registration | login | password_reset
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "verified": true,
    "accessToken": "jwt_access_token",
    "refreshToken": "jwt_refresh_token",
    "expiresIn": 3600,
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "phone": "+919876543210",
      "role": "member",
      "status": "active",
      "profile": {
        "fullName": "Ramesh Kumar",
        "avatarUrl": null,
        "isComplete": false
      }
    }
  }
}
```

**Errors:**
| Code | Status | Description |
|------|--------|-------------|
| INVALID_OTP | 400 | Incorrect OTP |
| OTP_EXPIRED | 400 | OTP has expired |
| MAX_ATTEMPTS | 429 | Too many attempts |

---

### POST /auth/send-otp
Send or resend OTP.

**Request:**
```json
{
  "contact": "user@example.com",
  "purpose": "registration"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "sent": true,
    "channel": "email",
    "expiresIn": 300,
    "retryAfter": 30
  }
}
```

---

### POST /auth/login
Login with credentials.

**Request:**
```json
{
  "identifier": "user@example.com",  // Email or phone
  "password": "SecurePass123!"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "accessToken": "jwt_access_token",
    "refreshToken": "jwt_refresh_token",
    "expiresIn": 3600,
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "phone": "+919876543210",
      "role": "member",
      "status": "active",
      "profile": {
        "fullName": "Ramesh Kumar",
        "displayName": "Ramesh",
        "avatarUrl": "https://...",
        "isComplete": true
      },
      "household": {
        "id": "uuid",
        "name": "Kumar Family",
        "role": "head"
      }
    }
  }
}
```

**Errors:**
| Code | Status | Description |
|------|--------|-------------|
| INVALID_CREDENTIALS | 401 | Wrong email/phone or password |
| ACCOUNT_LOCKED | 423 | Too many failed attempts |
| ACCOUNT_SUSPENDED | 403 | Account is suspended |
| EMAIL_NOT_VERIFIED | 403 | Email verification pending |

---

### POST /auth/login/google
Login or register with Google OAuth.

**Request:**
```json
{
  "idToken": "google_id_token",
  "role": "member"                   // For new registrations
}
```

**Response (200 OK):**
Same as POST /auth/login

---

### POST /auth/login/apple
Login or register with Apple Sign-In.

**Request:**
```json
{
  "identityToken": "apple_identity_token",
  "authorizationCode": "apple_auth_code",
  "fullName": "Ramesh Kumar",        // First login only
  "role": "member"
}
```

**Response (200 OK):**
Same as POST /auth/login

---

### POST /auth/refresh
Refresh access token.

**Request:**
```json
{
  "refreshToken": "jwt_refresh_token"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "accessToken": "new_jwt_access_token",
    "refreshToken": "new_jwt_refresh_token",
    "expiresIn": 3600
  }
}
```

---

### POST /auth/logout
Logout and invalidate tokens.

**Headers:** `Authorization: Bearer <access_token>`

**Request:**
```json
{
  "allDevices": false                // true to logout everywhere
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "loggedOut": true,
    "devicesLoggedOut": 1
  }
}
```

---

### POST /auth/forgot-password
Initiate password reset.

**Request:**
```json
{
  "contact": "user@example.com"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "sent": true,
    "channel": "email",
    "expiresIn": 900
  }
}
```

---

### POST /auth/reset-password
Reset password with OTP.

**Request:**
```json
{
  "contact": "user@example.com",
  "otp": "123456",
  "newPassword": "NewSecurePass123!"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "reset": true,
    "sessionsInvalidated": 3
  }
}
```

---

## User Profile APIs

### GET /users/me
Get current user profile.

**Headers:** `Authorization: Bearer <access_token>`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "phone": "+919876543210",
    "role": "member",
    "status": "active",
    "emailVerified": true,
    "phoneVerified": true,
    "createdAt": "2024-01-15T10:30:00Z",
    "profile": {
      "fullName": "Ramesh Kumar",
      "displayName": "Ramesh",
      "avatarUrl": "https://...",
      "dateOfBirth": "1985-05-15",
      "gotra": "Kashyapa",
      "nakshatra": "Ashwini",
      "rashi": "Mesha",
      "languagePreference": "en",
      "isComplete": true
    },
    "household": {
      "id": "uuid",
      "name": "Kumar Family",
      "role": "head",
      "memberCount": 4
    },
    "addresses": [
      {
        "id": "uuid",
        "type": "home",
        "label": "Home",
        "line1": "123 Temple Street",
        "city": "Hyderabad",
        "state": "Telangana",
        "pincode": "500001",
        "isPrimary": true
      }
    ]
  }
}
```

---

### PATCH /users/me/profile
Update user profile.

**Headers:** `Authorization: Bearer <access_token>`

**Request:**
```json
{
  "fullName": "Ramesh Kumar Sharma",
  "displayName": "Ramesh",
  "dateOfBirth": "1985-05-15",
  "gotra": "Kashyapa",
  "nakshatra": "Ashwini",
  "rashi": "Mesha",
  "languagePreference": "hi"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "profile": {
      "fullName": "Ramesh Kumar Sharma",
      ...
    },
    "isComplete": true
  }
}
```

---

### POST /users/me/avatar
Upload profile picture.

**Headers:** 
- `Authorization: Bearer <access_token>`
- `Content-Type: multipart/form-data`

**Request:**
```
avatar: <file>  (max 5MB, jpg/png)
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "avatarUrl": "https://cdn.../avatars/uuid.jpg"
  }
}
```

---

### POST /users/me/change-password
Change password.

**Headers:** `Authorization: Bearer <access_token>`

**Request:**
```json
{
  "currentPassword": "OldPass123!",
  "newPassword": "NewPass456!",
  "logoutOtherDevices": true
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "changed": true,
    "devicesLoggedOut": 2
  }
}
```

---

## Household APIs

### POST /households
Create a new household.

**Headers:** `Authorization: Bearer <access_token>`

**Request:**
```json
{
  "name": "Kumar Family",
  "address": {
    "type": "home",
    "line1": "123 Temple Street",
    "line2": "Near Hanuman Temple",
    "city": "Hyderabad",
    "state": "Telangana",
    "pincode": "500001",
    "latitude": 17.385044,
    "longitude": 78.486671
  }
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Kumar Family",
    "headUserId": "uuid",
    "status": "active",
    "createdAt": "2024-01-15T10:30:00Z",
    "address": {
      "id": "uuid",
      ...
    },
    "members": [
      {
        "userId": "uuid",
        "fullName": "Ramesh Kumar",
        "role": "head",
        "joinedAt": "2024-01-15T10:30:00Z"
      }
    ]
  }
}
```

**Errors:**
| Code | Status | Description |
|------|--------|-------------|
| ALREADY_HEAD | 400 | User is already head of a household |

---

### GET /households/:id
Get household details.

**Headers:** `Authorization: Bearer <access_token>`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Kumar Family",
    "headUserId": "uuid",
    "status": "active",
    "createdAt": "2024-01-15T10:30:00Z",
    "address": { ... },
    "members": [
      {
        "userId": "uuid",
        "fullName": "Ramesh Kumar",
        "displayName": "Ramesh",
        "avatarUrl": "https://...",
        "role": "head",
        "joinedAt": "2024-01-15T10:30:00Z"
      },
      {
        "userId": "uuid",
        "fullName": "Lakshmi Kumar",
        "role": "adult",
        "joinedAt": "2024-01-16T08:00:00Z"
      }
    ],
    "pendingInvites": 2
  }
}
```

---

### PATCH /households/:id
Update household details.

**Headers:** `Authorization: Bearer <access_token>`

**Request:**
```json
{
  "name": "Kumar Sharma Family"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Kumar Sharma Family",
    ...
  }
}
```

---

### POST /households/:id/invites
Invite a member to household.

**Headers:** `Authorization: Bearer <access_token>`

**Request:**
```json
{
  "contact": "+919876543211",        // Email or phone
  "role": "adult",                   // adult | child
  "message": "Join our family on Swadhrama!"  // Optional
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "householdId": "uuid",
    "inviteeContact": "+919876543211",
    "role": "adult",
    "status": "pending",
    "inviteLink": "https://app.swadharmaparirakshna.com/invite/abc123",
    "expiresAt": "2024-01-22T10:30:00Z",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

---

### GET /households/:id/invites
List pending invitations.

**Headers:** `Authorization: Bearer <access_token>`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "invites": [
      {
        "id": "uuid",
        "inviteeContact": "+919876543211",
        "role": "adult",
        "status": "pending",
        "expiresAt": "2024-01-22T10:30:00Z",
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ],
    "total": 1
  }
}
```

---

### DELETE /households/:id/invites/:inviteId
Cancel an invitation.

**Headers:** `Authorization: Bearer <access_token>`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "cancelled": true
  }
}
```

---

### GET /invites/:token
Get invitation details (unauthenticated).

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "householdName": "Kumar Family",
    "inviterName": "Ramesh Kumar",
    "role": "adult",
    "expiresAt": "2024-01-22T10:30:00Z",
    "status": "pending"
  }
}
```

---

### POST /invites/:token/accept
Accept an invitation.

**Headers:** `Authorization: Bearer <access_token>`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "accepted": true,
    "household": {
      "id": "uuid",
      "name": "Kumar Family",
      "role": "adult"
    }
  }
}
```

---

### POST /invites/:token/decline
Decline an invitation.

**Headers:** `Authorization: Bearer <access_token>`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "declined": true
  }
}
```

---

### PATCH /households/:id/members/:userId
Update member role.

**Headers:** `Authorization: Bearer <access_token>`

**Request:**
```json
{
  "role": "child"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "userId": "uuid",
    "role": "child",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

---

### DELETE /households/:id/members/:userId
Remove a member from household.

**Headers:** `Authorization: Bearer <access_token>`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "removed": true
  }
}
```

---

### POST /households/:id/transfer
Transfer head role.

**Headers:** `Authorization: Bearer <access_token>`

**Request:**
```json
{
  "newHeadUserId": "uuid"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "transferred": true,
    "newHead": {
      "userId": "uuid",
      "fullName": "Lakshmi Kumar"
    }
  }
}
```

---

### POST /households/:id/leave
Leave a household.

**Headers:** `Authorization: Bearer <access_token>`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "left": true
  }
}
```

---

## Address APIs

### POST /addresses
Add a new address.

**Headers:** `Authorization: Bearer <access_token>`

**Request:**
```json
{
  "householdId": "uuid",             // Optional, for household address
  "type": "home",
  "label": "Home",
  "line1": "123 Temple Street",
  "line2": "Near Hanuman Temple",
  "landmark": "Opposite SBI Bank",
  "city": "Hyderabad",
  "state": "Telangana",
  "pincode": "500001",
  "latitude": 17.385044,
  "longitude": 78.486671,
  "isPrimary": true
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "type": "home",
    "label": "Home",
    ...
  }
}
```

---

### GET /addresses
List user's addresses.

**Headers:** `Authorization: Bearer <access_token>`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "addresses": [
      {
        "id": "uuid",
        "type": "home",
        ...
      }
    ],
    "total": 2
  }
}
```

---

### PATCH /addresses/:id
Update an address.

**Headers:** `Authorization: Bearer <access_token>`

**Request:**
```json
{
  "line1": "124 Temple Street",
  "isPrimary": true
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    ...
  }
}
```

---

### DELETE /addresses/:id
Delete an address.

**Headers:** `Authorization: Bearer <access_token>`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "deleted": true
  }
}
```

---

## Admin APIs

### POST /admin/auth/login
Admin login with MFA.

**Request:**
```json
{
  "email": "admin@swadharmaparirakshna.com",
  "password": "AdminSecure123!",
  "mfaCode": "123456"
}
```

**Response (200 OK):**
Same as regular login with admin role.

---

### GET /admin/users
List all users (paginated).

**Headers:** `Authorization: Bearer <admin_access_token>`

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 20, max: 100)
- `search` (name, email, phone)
- `role` (member, provider, admin)
- `status` (pending, active, suspended)
- `sortBy` (createdAt, name)
- `sortOrder` (asc, desc)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "uuid",
        "email": "user@example.com",
        "phone": "+919876543210",
        "role": "member",
        "status": "active",
        "profile": {
          "fullName": "Ramesh Kumar"
        },
        "createdAt": "2024-01-15T10:30:00Z",
        "lastLoginAt": "2024-01-20T08:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8
    }
  }
}
```

---

### GET /admin/users/:id
Get user details.

**Headers:** `Authorization: Bearer <admin_access_token>`

**Response (200 OK):**
Full user details including audit history.

---

### PATCH /admin/users/:id/status
Update user status.

**Headers:** `Authorization: Bearer <admin_access_token>`

**Request:**
```json
{
  "status": "suspended",
  "reason": "Violation of terms of service"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "suspended",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

---

## Rate Limiting

| Endpoint Pattern | Limit | Window |
|------------------|-------|--------|
| /auth/login | 5 | 15 min |
| /auth/send-otp | 3 | 5 min |
| /auth/verify-otp | 5 | 5 min |
| /auth/register | 3 | 1 hour |
| General API | 100 | 1 min |
| Admin API | 200 | 1 min |

**Rate Limit Headers:**
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1705312500
```
