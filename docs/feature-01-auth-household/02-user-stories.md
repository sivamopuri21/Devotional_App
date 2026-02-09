# Feature 1: User Stories

## Member Role

### Registration & Authentication

#### US-M-001: Register with Email
**As a** new member  
**I want to** register using my email address  
**So that** I can access the devotional services platform

**Acceptance Criteria:**
- [ ] User can enter email and password
- [ ] Password must meet complexity requirements (8+ chars, 1 uppercase, 1 number)
- [ ] Email verification OTP sent within 5 seconds
- [ ] User cannot proceed without email verification
- [ ] Duplicate email shows appropriate error

---

#### US-M-002: Register with Phone
**As a** new member  
**I want to** register using my phone number  
**So that** I can quickly access services without email

**Acceptance Criteria:**
- [ ] User can enter phone number with country code
- [ ] SMS OTP sent within 5 seconds
- [ ] OTP expires after 5 minutes
- [ ] Maximum 3 OTP attempts per session
- [ ] Resend OTP available after 30 seconds

---

#### US-M-003: Social Login (Google)
**As a** new member  
**I want to** sign up using my Google account  
**So that** I can register quickly without creating new credentials

**Acceptance Criteria:**
- [ ] Google sign-in button visible on login screen
- [ ] OAuth2 flow completes seamlessly
- [ ] Profile picture and name auto-populated
- [ ] Email verified automatically
- [ ] Existing email accounts linked properly

---

#### US-M-004: Social Login (Apple)
**As a** new iOS member  
**I want to** sign up using my Apple ID  
**So that** I can use privacy-focused sign-in

**Acceptance Criteria:**
- [ ] Apple sign-in button visible on iOS devices
- [ ] Email hiding option supported
- [ ] OAuth2 flow completes seamlessly
- [ ] Works on both iOS and web

---

#### US-M-005: Login with Credentials
**As a** registered member  
**I want to** login with my email/phone and password  
**So that** I can access my account

**Acceptance Criteria:**
- [ ] Login with email + password
- [ ] Login with phone + password
- [ ] Show/hide password toggle
- [ ] "Remember me" option for 30 days
- [ ] Account lockout after 5 failed attempts

---

#### US-M-006: Password Reset
**As a** member who forgot password  
**I want to** reset my password securely  
**So that** I can regain access to my account

**Acceptance Criteria:**
- [ ] Request reset via email or phone
- [ ] OTP/link sent for verification
- [ ] New password must differ from last 3 passwords
- [ ] All active sessions invalidated after reset
- [ ] Confirmation notification sent

---

#### US-M-007: Complete Profile
**As a** newly registered member  
**I want to** complete my profile  
**So that** service providers can serve me better

**Acceptance Criteria:**
- [ ] Required: Full name, Gotra (optional), Nakshatra (optional)
- [ ] Optional: Date of birth, Profile photo
- [ ] Address for home services (can add later)
- [ ] Language preference selection
- [ ] Profile completion progress shown

---

### Household Management

#### US-M-008: Create Household
**As a** member  
**I want to** create my household  
**So that** my family can share services and bookings

**Acceptance Criteria:**
- [ ] Enter household name
- [ ] Creator becomes household head
- [ ] Default address from member profile
- [ ] Household unique ID generated
- [ ] Can create only one household as head

---

#### US-M-009: Invite Family Members
**As a** household head  
**I want to** invite family members  
**So that** they can access our household services

**Acceptance Criteria:**
- [ ] Invite via phone number or email
- [ ] Generate shareable invite link
- [ ] Set member role (Adult/Child)
- [ ] Invitation expires after 7 days
- [ ] Track pending invitations

---

#### US-M-010: Accept Household Invitation
**As a** member  
**I want to** accept a household invitation  
**So that** I can join my family's household

**Acceptance Criteria:**
- [ ] View invitation details before accepting
- [ ] See household name and inviter
- [ ] Accept or decline option
- [ ] Auto-join if clicking invite link while logged in
- [ ] Notification on successful join

---

#### US-M-011: Manage Household Members
**As a** household head  
**I want to** manage my household members  
**So that** I can control access and roles

**Acceptance Criteria:**
- [ ] View all household members
- [ ] Change member roles
- [ ] Remove members from household
- [ ] Transfer head role to adult member
- [ ] Cannot remove self as last member

---

#### US-M-012: Leave Household
**As a** household member  
**I want to** leave a household  
**So that** I can manage my own services independently

**Acceptance Criteria:**
- [ ] Confirm before leaving
- [ ] Head must transfer role before leaving
- [ ] Active bookings warning shown
- [ ] Booking history retained
- [ ] Can join another household

---

## Service Provider Role

> *Note: Full service provider registration is Feature 2+. This feature only covers basic account creation.*

#### US-SP-001: Register Provider Account
**As a** service provider  
**I want to** create my account  
**So that** I can later register my services

**Acceptance Criteria:**
- [ ] Same registration flow as member
- [ ] Select "Register as Service Provider" option
- [ ] Account marked for provider verification
- [ ] Basic profile completion required
- [ ] Provider dashboard access (limited until Feature 2)

---

## Admin Role

#### US-A-001: Admin Login
**As an** admin  
**I want to** login to the admin portal  
**So that** I can manage the platform

**Acceptance Criteria:**
- [ ] Separate admin login endpoint
- [ ] Multi-factor authentication required
- [ ] Audit log for all admin actions
- [ ] Session timeout after 30 minutes inactivity
- [ ] IP whitelisting support

---

#### US-A-002: View User List
**As an** admin  
**I want to** view all registered users  
**So that** I can monitor platform usage

**Acceptance Criteria:**
- [ ] Paginated user list
- [ ] Search by name, email, phone
- [ ] Filter by role, status, date
- [ ] Export to CSV
- [ ] View user details without editing

---

#### US-A-003: Manage User Status
**As an** admin  
**I want to** activate/deactivate user accounts  
**So that** I can enforce platform policies

**Acceptance Criteria:**
- [ ] Activate/deactivate accounts
- [ ] Reason required for deactivation
- [ ] User notified on status change
- [ ] Deactivated users cannot login
- [ ] Audit trail maintained
