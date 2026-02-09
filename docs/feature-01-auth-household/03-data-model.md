# Feature 1: Data Model

## Entity Relationship Diagram

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│     users       │       │   households    │       │   addresses     │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)         │       │ id (PK)         │
│ email           │       │ name            │       │ user_id (FK)    │
│ phone           │       │ head_user_id(FK)│◄──────│ household_id(FK)│
│ password_hash   │       │ created_at      │       │ type            │
│ status          │       │ updated_at      │       │ line1, line2    │
│ role            │       │ status          │       │ city, state     │
│ created_at      │       └─────────────────┘       │ pincode         │
│ updated_at      │               │                 │ lat, lng        │
└─────────────────┘               │                 │ is_primary      │
        │                         │                 └─────────────────┘
        │                         │
        ▼                         ▼
┌─────────────────┐       ┌─────────────────┐
│  user_profiles  │       │household_members│
├─────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)         │
│ user_id (FK)    │       │ household_id(FK)│
│ full_name       │       │ user_id (FK)    │
│ display_name    │       │ role            │
│ avatar_url      │       │ joined_at       │
│ date_of_birth   │       │ invited_by (FK) │
│ gotra           │       │ status          │
│ nakshatra       │       └─────────────────┘
│ language_pref   │
│ created_at      │
│ updated_at      │
└─────────────────┘

┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│  auth_tokens    │       │household_invites│       │   audit_logs    │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)         │       │ id (PK)         │
│ user_id (FK)    │       │ household_id(FK)│       │ user_id (FK)    │
│ token_hash      │       │ inviter_id (FK) │       │ action          │
│ token_type      │       │ invitee_contact │       │ entity_type     │
│ device_info     │       │ role            │       │ entity_id       │
│ ip_address      │       │ token           │       │ old_value       │
│ expires_at      │       │ status          │       │ new_value       │
│ created_at      │       │ expires_at      │       │ ip_address      │
│ revoked_at      │       │ created_at      │       │ user_agent      │
└─────────────────┘       └─────────────────┘       │ created_at      │
                                                    └─────────────────┘
┌─────────────────┐       ┌─────────────────┐
│   otp_codes     │       │ social_accounts │
├─────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)         │
│ user_id (FK)    │       │ user_id (FK)    │
│ code_hash       │       │ provider        │
│ purpose         │       │ provider_user_id│
│ contact         │       │ email           │
│ attempts        │       │ access_token    │
│ expires_at      │       │ refresh_token   │
│ verified_at     │       │ created_at      │
│ created_at      │       │ updated_at      │
└─────────────────┘       └─────────────────┘
```

---

## Table Definitions

### 1. users
Primary user identity table.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT uuid_generate_v4() | Unique identifier |
| email | VARCHAR(255) | UNIQUE, NULLABLE | User email address |
| phone | VARCHAR(20) | UNIQUE, NULLABLE | Phone with country code |
| password_hash | VARCHAR(255) | NULLABLE | Bcrypt hashed password |
| email_verified | BOOLEAN | DEFAULT false | Email verification status |
| phone_verified | BOOLEAN | DEFAULT false | Phone verification status |
| status | ENUM | DEFAULT 'pending' | pending, active, suspended, deleted |
| role | ENUM | DEFAULT 'member' | member, provider, admin |
| failed_login_attempts | INTEGER | DEFAULT 0 | For account lockout |
| locked_until | TIMESTAMP | NULLABLE | Account lockout expiry |
| last_login_at | TIMESTAMP | NULLABLE | Last successful login |
| password_changed_at | TIMESTAMP | NULLABLE | For session invalidation |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation time |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update time |

**Indexes:**
- `idx_users_email` ON (email)
- `idx_users_phone` ON (phone)
- `idx_users_status` ON (status)

**Constraints:**
- CHECK (email IS NOT NULL OR phone IS NOT NULL)

---

### 2. user_profiles
Extended user profile information.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| user_id | UUID | FK → users(id), UNIQUE | Reference to user |
| full_name | VARCHAR(100) | NOT NULL | User's full name |
| display_name | VARCHAR(50) | NULLABLE | Preferred display name |
| avatar_url | VARCHAR(500) | NULLABLE | Profile picture URL |
| date_of_birth | DATE | NULLABLE | DOB for astrology services |
| gotra | VARCHAR(50) | NULLABLE | Family lineage |
| nakshatra | VARCHAR(50) | NULLABLE | Birth star |
| rashi | VARCHAR(50) | NULLABLE | Zodiac sign |
| language_pref | VARCHAR(10) | DEFAULT 'en' | Preferred language |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation time |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update time |

**Indexes:**
- `idx_profiles_user_id` ON (user_id)

---

### 3. households
Family/household container.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| name | VARCHAR(100) | NOT NULL | Household display name |
| head_user_id | UUID | FK → users(id) | Household head |
| status | ENUM | DEFAULT 'active' | active, inactive |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation time |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update time |

**Indexes:**
- `idx_households_head` ON (head_user_id)

---

### 4. household_members
Junction table for household membership.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| household_id | UUID | FK → households(id) | Reference to household |
| user_id | UUID | FK → users(id) | Reference to member |
| role | ENUM | DEFAULT 'adult' | head, adult, child |
| status | ENUM | DEFAULT 'active' | active, removed, left |
| invited_by | UUID | FK → users(id), NULLABLE | Who invited this member |
| joined_at | TIMESTAMP | DEFAULT NOW() | When member joined |
| left_at | TIMESTAMP | NULLABLE | When member left |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation time |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update time |

**Indexes:**
- `idx_hm_household` ON (household_id)
- `idx_hm_user` ON (user_id)
- UNIQUE (household_id, user_id) WHERE status = 'active'

---

### 5. household_invites
Pending household invitations.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| household_id | UUID | FK → households(id) | Target household |
| inviter_id | UUID | FK → users(id) | Who sent invite |
| invitee_contact | VARCHAR(255) | NOT NULL | Email or phone |
| invitee_user_id | UUID | FK → users(id), NULLABLE | If already registered |
| role | ENUM | DEFAULT 'adult' | Proposed role |
| token | VARCHAR(64) | UNIQUE, NOT NULL | Invite token |
| status | ENUM | DEFAULT 'pending' | pending, accepted, declined, expired |
| expires_at | TIMESTAMP | NOT NULL | Invite expiry |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation time |
| responded_at | TIMESTAMP | NULLABLE | When responded |

**Indexes:**
- `idx_invites_token` ON (token)
- `idx_invites_household` ON (household_id)
- `idx_invites_contact` ON (invitee_contact)

---

### 6. addresses
User and household addresses.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| user_id | UUID | FK → users(id), NULLABLE | Owner user |
| household_id | UUID | FK → households(id), NULLABLE | Owner household |
| type | ENUM | DEFAULT 'home' | home, office, temple, other |
| label | VARCHAR(50) | NULLABLE | Custom label |
| line1 | VARCHAR(200) | NOT NULL | Address line 1 |
| line2 | VARCHAR(200) | NULLABLE | Address line 2 |
| landmark | VARCHAR(100) | NULLABLE | Nearby landmark |
| city | VARCHAR(100) | NOT NULL | City name |
| state | VARCHAR(100) | NOT NULL | State name |
| pincode | VARCHAR(10) | NOT NULL | Postal code |
| country | VARCHAR(50) | DEFAULT 'India' | Country |
| latitude | DECIMAL(10,8) | NULLABLE | GPS latitude |
| longitude | DECIMAL(11,8) | NULLABLE | GPS longitude |
| is_primary | BOOLEAN | DEFAULT false | Primary address flag |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation time |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update time |

**Indexes:**
- `idx_addresses_user` ON (user_id)
- `idx_addresses_household` ON (household_id)
- `idx_addresses_pincode` ON (pincode)

**Constraints:**
- CHECK (user_id IS NOT NULL OR household_id IS NOT NULL)

---

### 7. auth_tokens
JWT refresh tokens and session management.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| user_id | UUID | FK → users(id) | Token owner |
| token_hash | VARCHAR(255) | NOT NULL | SHA256 of refresh token |
| token_type | ENUM | DEFAULT 'refresh' | refresh, reset_password |
| device_info | JSONB | NULLABLE | Device details |
| ip_address | INET | NULLABLE | Client IP |
| user_agent | VARCHAR(500) | NULLABLE | Browser/app info |
| expires_at | TIMESTAMP | NOT NULL | Token expiry |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation time |
| revoked_at | TIMESTAMP | NULLABLE | When revoked |
| revoked_reason | VARCHAR(50) | NULLABLE | logout, password_change, etc |

**Indexes:**
- `idx_tokens_user` ON (user_id)
- `idx_tokens_hash` ON (token_hash)
- `idx_tokens_expires` ON (expires_at)

---

### 8. social_accounts
OAuth provider connections.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| user_id | UUID | FK → users(id) | Linked user |
| provider | ENUM | NOT NULL | google, apple |
| provider_user_id | VARCHAR(255) | NOT NULL | Provider's user ID |
| email | VARCHAR(255) | NULLABLE | Email from provider |
| name | VARCHAR(100) | NULLABLE | Name from provider |
| avatar_url | VARCHAR(500) | NULLABLE | Profile pic URL |
| access_token | TEXT | NULLABLE | Encrypted access token |
| refresh_token | TEXT | NULLABLE | Encrypted refresh token |
| token_expires_at | TIMESTAMP | NULLABLE | Token expiry |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation time |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update time |

**Indexes:**
- `idx_social_user` ON (user_id)
- UNIQUE (provider, provider_user_id)

---

### 9. otp_codes
One-time passwords for verification.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| user_id | UUID | FK → users(id), NULLABLE | Associated user |
| code_hash | VARCHAR(255) | NOT NULL | SHA256 of OTP |
| purpose | ENUM | NOT NULL | registration, login, password_reset, invite |
| contact | VARCHAR(255) | NOT NULL | Email or phone |
| attempts | INTEGER | DEFAULT 0 | Verification attempts |
| max_attempts | INTEGER | DEFAULT 3 | Maximum allowed attempts |
| expires_at | TIMESTAMP | NOT NULL | OTP expiry |
| verified_at | TIMESTAMP | NULLABLE | When verified |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation time |

**Indexes:**
- `idx_otp_contact` ON (contact)
- `idx_otp_expires` ON (expires_at)

---

### 10. audit_logs
Security audit trail.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| user_id | UUID | FK → users(id), NULLABLE | Acting user |
| action | VARCHAR(50) | NOT NULL | Action performed |
| entity_type | VARCHAR(50) | NULLABLE | Affected entity type |
| entity_id | UUID | NULLABLE | Affected entity ID |
| old_value | JSONB | NULLABLE | Previous state |
| new_value | JSONB | NULLABLE | New state |
| ip_address | INET | NULLABLE | Client IP |
| user_agent | VARCHAR(500) | NULLABLE | Browser/app info |
| metadata | JSONB | NULLABLE | Additional context |
| created_at | TIMESTAMP | DEFAULT NOW() | Event timestamp |

**Indexes:**
- `idx_audit_user` ON (user_id)
- `idx_audit_entity` ON (entity_type, entity_id)
- `idx_audit_action` ON (action)
- `idx_audit_created` ON (created_at)

---

## Enums

```sql
CREATE TYPE user_status AS ENUM ('pending', 'active', 'suspended', 'deleted');
CREATE TYPE user_role AS ENUM ('member', 'provider', 'admin');
CREATE TYPE household_role AS ENUM ('head', 'adult', 'child');
CREATE TYPE member_status AS ENUM ('active', 'removed', 'left');
CREATE TYPE invite_status AS ENUM ('pending', 'accepted', 'declined', 'expired');
CREATE TYPE address_type AS ENUM ('home', 'office', 'temple', 'other');
CREATE TYPE token_type AS ENUM ('refresh', 'reset_password');
CREATE TYPE social_provider AS ENUM ('google', 'apple');
CREATE TYPE otp_purpose AS ENUM ('registration', 'login', 'password_reset', 'invite');
```

---

## Future Extensibility

### Reserved for Feature 2+
- `provider_profiles` - Service provider specific data
- `provider_verifications` - KYC documents
- `service_areas` - Geographic coverage

### Soft Delete Strategy
All entities support soft delete via status fields. Physical deletion only via data retention jobs.

### Multi-tenancy Ready
Schema designed to support multi-tenant isolation if needed via tenant_id addition.
