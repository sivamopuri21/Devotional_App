# Feature 1: Extensibility Notes

## Architecture for Future Features

### User Entity Extensions

**Feature 2 (Service Catalog):**
```
users → provider_profiles (1:1 for providers)
      → provider_services (1:N)
      → service_areas (1:N)
```

**Feature 6 (Ratings):**
```
users → reviews_given (1:N)
      → reviews_received (1:N as provider)
```

### Household Extensions

**Feature 3 (Bookings):**
```
households → bookings (1:N)
           → booking_preferences (1:1)
```

**Feature 4 (Payments):**
```
households → payment_methods (1:N)
           → billing_address (1:1)
```

---

## Event-Driven Hooks

Current events emitted (ready for future features):
- `user.registered` → Trigger welcome notification (F5)
- `user.verified` → Enable booking capability (F3)
- `household.created` → Initialize preferences
- `household.member.joined` → Notify household head (F5)

---

## API Versioning
- URL versioning: `/api/v1/`, `/api/v2/`
- Backward compatible changes within version
- Deprecation headers for old endpoints

---

## Database Extensibility

### Metadata Fields
All tables include JSONB `metadata` column for:
- Feature flags
- A/B testing variants
- Quick schema extensions

### Soft Delete
All entities support soft delete for:
- Data recovery
- Audit compliance
- Referential integrity

---

## Multi-tenancy Ready
Schema supports future multi-tenant isolation via:
- tenant_id column (optional)
- Row-level security policies
- Separate connection pools

---

## Localization Ready
- All strings externalized
- RTL layout support in UI
- Multi-language support structure (hi, te, ta, kn, ml)
