# Feature 1: UI Wireframe Descriptions

## Design System

### Colors
| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| --primary | #FF6B00 | #FF8533 | CTAs, headers |
| --secondary | #8B0000 | #B22222 | Accents |
| --gold | #FFD700 | #FFE135 | Highlights |
| --bg-primary | #FFFFFF | #1A1A2E | Background |
| --text-primary | #2D2D2D | #FFFFFF | Text |

### Typography
- H1: Poppins 32px/700
- H2: Poppins 24px/600
- Body: Inter 16px/400
- Button: Inter 16px/600

---

## Screens

### 1. Splash Screen
- Centered logo with saffron glow
- App name in Sanskrit-style font
- Gold animated loader
- Gradient background (saffron to maroon)
- Duration: 2-3s with fade transition

### 2. Welcome (3 slides)
- Full-width illustration (60% height)
- Heading + description
- Pagination dots, swipeable
- "Get Started" CTA + "Skip" link

### 3. Login Screen
- Small centered logo
- Email/Phone input with icon
- Password with visibility toggle
- Remember me checkbox + Forgot link
- Primary Sign In button
- OR divider
- Google & Apple social buttons
- Sign Up link

### 4. Registration Screen
- Full name, email, phone inputs
- Password with requirements checklist
- "I am a Service Provider" toggle
- Terms/Privacy links
- Create Account button

### 5. OTP Verification
- 6-digit input boxes with auto-advance
- Countdown timer (expires in mm:ss)
- Resend link with 30s cooldown
- Shake animation on error

### 6. Forgot/Reset Password
- Contact input for forgot
- New password + confirm with checklist
- All sessions invalidation notice

### 7. Complete Profile
- Avatar upload
- Display name, DOB, Gotra, Nakshatra dropdowns
- Language preference
- Progress bar showing completion %
- Skip option available

### 8. Home Screen
- Greeting with family name
- 2x2 quick action grid (Pooja, Shop, Astrology, Panchang)
- Quick actions list (Household, Address)
- Bottom navigation (Home, Book, Cart, Profile)

### 9. Household Management
- Header with family name, member count
- Member cards with role badges
- Pending invites section
- Invite button at bottom
- Actions: Change role, Remove, Transfer head

### 10. Invite Member
- Phone/Email tab switch
- Role dropdown (Adult/Child)
- Optional message
- Send button + Share link option

### 11. Address Management
- Address cards with type icon, primary star
- Actions menu (Edit, Set Primary, Delete)
- Add new address button

### 12. Profile Screen
- Avatar, name, contact display
- Details: DOB, Gotra, Nakshatra
- Settings: Language, Change Password, Logout

---

## Animations
| Animation | Duration |
|-----------|----------|
| Page Transition | 300ms slide |
| Button Press | 100ms scale |
| Modal Open/Close | 200-250ms |
| OTP Error | 400ms shake |

## Accessibility
- 4.5:1 contrast ratio
- 44x44dp touch targets
- 200% font scaling support
- Screen reader labels
