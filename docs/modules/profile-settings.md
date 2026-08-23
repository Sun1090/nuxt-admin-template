---
outline: deep
---

# Profile & Settings

Personal settings pages for individual users — profile info, account security, appearance, display preferences, and notification settings.

## Features

### Profile

Update personal information:
- Avatar (via DiceBear avatar generation)
- Display name
- Email and phone number

### Account

Account security management:
- Change password (requires current password)
- View last login time and IP

### Appearance

Visual theme customization:
- Light / Dark / System theme toggle
- Sidebar collapsed state

### Display

Display preferences:
- Dense mode toggle (compact UI)
- Animation preference

### Notification Settings

Per-user notification preferences:
- Enable/disable all notifications

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/change-password` | Change current user's password |

Profile and settings data is managed through the user CRUD endpoints under `/api/systems/users`.

## Related Components

- `app/pages/settings/profile.vue` — Profile page
- `app/pages/settings/account.vue` — Account/security page
- `app/pages/settings/appearance.vue` — Appearance settings page
- `app/pages/settings/display.vue` — Display settings page
- `app/pages/settings/notifications.vue` — Notification settings page
- `app/components/settings/ProfileForm.vue` — Profile edit form
- `app/components/settings/AccountForm.vue` — Account security form
- `app/components/settings/AppearanceForm.vue` — Appearance form
- `app/components/settings/DisplayForm.vue` — Display form
- `app/components/settings/NotificationsForm.vue` — Notification settings form
- `app/components/settings/SidebarNav.vue` — Settings navigation sidebar
- `app/components/settings/Layout.vue` — Settings page layout wrapper

## Permissions

Profile and settings are personal and do not require special permissions beyond being logged in.
