# Swadhrama Parirakshna - Project Overview

## Application Name
**Swadhrama Parirakshna** (स्वधर्म परिरक्षणा) - "Protecting One's Sacred Duty"

---

## Vision
A comprehensive digital platform connecting devotees with authentic religious service providers (Poojaris, Astrologers) and sacred product vendors, enabling seamless booking of home rituals, ceremonies, and procurement of religious items.

---

## Business Context

### Primary Roles
| Role | Description |
|------|-------------|
| **Member** | Devotees who request services and purchase products |
| **Service Provider** | Poojaris, Astrologers, Pooja Stores fulfilling requests |
| **Admin** | Platform administrators managing operations |

### Core Use Cases
1. Member & Service Provider enrollment
2. Requesting/scheduling Pooja, Vratam, Homam
3. Master data management for services
4. Real-time status tracking
5. Secure payments
6. Ratings and feedback

---

## Technical Stack

| Layer | Technology |
|-------|------------|
| Mobile | Flutter (Android & iOS) |
| Web UI | React.js |
| Backend | Node.js with Express.js |
| Database | PostgreSQL |
| Cloud | AWS |
| CI/CD | GitHub Actions |
| Auth | OAuth2 / JWT |

---

## Architecture Principles

### Clean Architecture Layers
```
┌─────────────────────────────────────┐
│         Presentation Layer          │
│   (Flutter / React Components)      │
├─────────────────────────────────────┤
│         Application Layer           │
│   (Use Cases / Business Logic)      │
├─────────────────────────────────────┤
│          Domain Layer               │
│   (Entities / Business Rules)       │
├─────────────────────────────────────┤
│       Infrastructure Layer          │
│   (DB / APIs / External Services)   │
└─────────────────────────────────────┘
```

### Key Principles
- **SOLID** principles throughout
- **API-first** stateless services
- **Modular** and independently deployable features
- **Extensible** data models
- **Secure** by design

---

## Non-Functional Requirements

| Requirement | Target |
|-------------|--------|
| Scalability | 1M+ concurrent users |
| Latency | < 200ms API response |
| Availability | 99.9% uptime |
| Security | OAuth2, JWT, RBAC, encryption at rest/transit |
| Accessibility | WCAG 2.1 AA compliant |

---

## Feature Roadmap

| # | Feature | Status |
|---|---------|--------|
| 1 | User Authentication & Household Management | 🔄 In Progress |
| 2 | Service Catalog | ⏳ Pending |
| 3 | Booking & Order Management | ⏳ Pending |
| 4 | Payments | ⏳ Pending |
| 5 | Notifications & Tracking | ⏳ Pending |
| 6 | Ratings & Reviews | ⏳ Pending |

---

## UI/UX Theme

### Color Palette
| Color | Hex | Usage |
|-------|-----|-------|
| Primary (Saffron) | `#FF6B00` | Primary actions, headers |
| Secondary (Maroon) | `#8B0000` | Accents, important text |
| Gold | `#FFD700` | Highlights, premium |
| Background Light | `#FFF8F0` | Light mode background |
| Background Dark | `#1A1A2E` | Dark mode background |
| Text Primary | `#2D2D2D` | Main text |
| Text Secondary | `#666666` | Secondary content |

### Typography
- **Primary Font**: Poppins (headings)
- **Secondary Font**: Inter (body text)
- **Sanskrit Text**: Noto Serif Devanagari

### Design Principles
- Task-oriented minimal home screen
- Smooth animations (300ms transitions)
- Micro-interactions for feedback
- High contrast for accessibility
- Font scaling support (up to 200%)
