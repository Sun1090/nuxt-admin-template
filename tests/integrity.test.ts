import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

// ====== Helper: extract menu permissions from constants/menus.ts ======
function extractMenuPermissions(): string[] {
  const content = readFileSync(path.resolve(__dirname, '../app/constants/menus.ts'), 'utf-8')
  const perms: string[] = []
  const regex = /requiredPermission:\s*'([^']+)'/g
  let match
  match = regex.exec(content)
  while (match !== null) {
    perms.push(match[1])
    match = regex.exec(content)
  }
  return [...new Set(perms)].sort()
}

function extractPageRoutePermissions(): string[] {
  const content = readFileSync(path.resolve(__dirname, '../app/middleware/auth.global.ts'), 'utf-8')
  const perms: string[] = []
  const regex = /'\/[^']+':\s*'([^']+)'/g
  let match
  match = regex.exec(content)
  while (match !== null) {
    perms.push(match[1])
    match = regex.exec(content)
  }
  return [...new Set(perms)].sort()
}

function extractInitPermissionsFromSQL(): string[] {
  const content = readFileSync(path.resolve(__dirname, '../scripts/sql/init-system.sql'), 'utf-8')
  const perms: string[] = []
  const regex = /'([^']+)',\s*'[^']*',\s*'[^']*'/g
  let match
  match = regex.exec(content)
  while (match !== null) {
    const name = match[1]
    if (name.startsWith('menu:') || name.startsWith('page:')
      || name.startsWith('action:') || name.startsWith('feature:')) {
      perms.push(name)
      match = regex.exec(content)
    }
  }
  return [...new Set(perms)].sort()
}

// ====== Menu-Permission Integrity Tests ======
describe('menu-Permission Integrity', () => {
  const menuPerms = extractMenuPermissions()

  it('every menu item references a menu: permission', () => {
    for (const perm of menuPerms) {
      expect(perm).toMatch(/^menu:/)
    }
  })

  it('all menu permissions present', () => {
    expect(menuPerms).toContain('menu:dashboard')
    expect(menuPerms).toContain('menu:user_mgmt')
    expect(menuPerms).toContain('menu:role_mgmt')
    expect(menuPerms).toContain('menu:permission_mgmt')
    expect(menuPerms).toContain('menu:email_templates')
    expect(menuPerms).toContain('menu:api_keys')
    expect(menuPerms).toContain('menu:api_logs')
    expect(menuPerms).toContain('menu:user_status_logs')
    expect(menuPerms).toContain('menu:system_database_backup')
    expect(menuPerms).toContain('menu:system_database_manage')
    expect(menuPerms).toContain('menu:system_settings')
    expect(menuPerms).toContain('menu:notifications')
  })

  it('menu permissions cover all 12 modules', () => {
    expect(menuPerms.length).toBeGreaterThanOrEqual(12)
  })
})

// ====== Route-Permission Mapping Tests ======
describe('route-Permission Mapping', () => {
  const pagePerms = extractPageRoutePermissions()

  it('every route maps to a page permission name', () => {
    for (const perm of pagePerms) {
      expect(typeof perm).toBe('string')
      expect(perm.length).toBeGreaterThan(0)
    }
  })

  it('all system modules have route mappings', () => {
    expect(pagePerms).toContain('users')
    expect(pagePerms).toContain('roles')
    expect(pagePerms).toContain('permissions')
    expect(pagePerms).toContain('email_templates')
    expect(pagePerms).toContain('api_keys')
    expect(pagePerms).toContain('api_logs')
    expect(pagePerms).toContain('user_status_logs')
    expect(pagePerms).toContain('notifications')
    expect(pagePerms).toContain('system_settings')
    expect(pagePerms).toContain('system_database_backup')
    expect(pagePerms).toContain('system_database_manage')
  })

  it('has at least 11 route-permission mappings', () => {
    expect(pagePerms.length).toBeGreaterThanOrEqual(11)
  })
})

// ====== SQL Init Permissions Coverage ======
describe('sQL Init Permissions Coverage', () => {
  const sqlPerms = extractInitPermissionsFromSQL()

  it('menu: permissions in SQL match menu config requirements', () => {
    const menuConfigPerms = extractMenuPermissions()
    for (const mp of menuConfigPerms) {
      expect(sqlPerms).toContain(mp)
    }
  })
})

// ====== Locale Structure Tests ======
describe('locale Structure', () => {
  it('locales directory has both language files', () => {
    const files = ['en.json', 'zh-CN.json']
    for (const f of files) {
      expect(() => readFileSync(path.resolve(__dirname, `../i18n/locales/${f}`), 'utf-8')).not.toThrow()
    }
  })

  it('both locale files are valid JSON', () => {
    for (const lang of ['en', 'zh-CN']) {
      const content = readFileSync(path.resolve(__dirname, `../i18n/locales/${lang}.json`), 'utf-8')
      expect(() => JSON.parse(content)).not.toThrow()
    }
  })
})

// ====== DB Schema Structure Tests ======
describe('dB Schema Structure', () => {
  it('schema defines all required tables', () => {
    const content = readFileSync(path.resolve(__dirname, '../app/drizzle/schema.ts'), 'utf-8')
    const tablePatterns = [
      'roles = pgTable',
      'users = pgTable',
      'permissions = pgTable',
      'rolePermissions = pgTable',
      'systemSettings = pgTable',
      'notifications = pgTable',
      'notificationSettings = pgTable',
      'apiKeys = pgTable',
      'apiKeyPermissions = pgTable',
      'apiLogs = pgTable',
      'userStatusLogs = pgTable',
      'emailTemplates = pgTable',
    ]
    for (const pattern of tablePatterns) {
      expect(content).toContain(pattern)
    }
  })
})

// ====== Page Existence Tests ======
describe('page Existence', () => {
  const pageFiles = [
    'app/pages/login.vue',
    'app/pages/dashboard.vue',
    'app/pages/(error)/401.vue',
    'app/pages/(error)/403.vue',
    'app/pages/(error)/404.vue',
    'app/pages/settings/profile.vue',
    'app/pages/settings/account.vue',
    'app/pages/settings/appearance.vue',
    'app/pages/settings/notifications.vue',
    'app/pages/settings/display.vue',
    'app/pages/systems/users/index.vue',
    'app/pages/systems/roles/index.vue',
    'app/pages/systems/permissions/index.vue',
    'app/pages/systems/email-templates/index.vue',
    'app/pages/systems/api-keys/index.vue',
    'app/pages/systems/api-logs/index.vue',
    'app/pages/systems/user-status-logs/index.vue',
    'app/pages/systems/notifications/index.vue',
    'app/pages/systems/settings/index.vue',
    'app/pages/systems/database/backup/index.vue',
    'app/pages/systems/database/manage/index.vue',
  ]

  for (const page of pageFiles) {
    it(`page exists: ${page}`, () => {
      expect(() => readFileSync(path.resolve(__dirname, `../${page}`), 'utf-8')).not.toThrow()
    })
  }
})

// ====== API Endpoint Existence Tests ======
describe('aPI Endpoint Existence', () => {
  const apiFiles = [
    'server/middleware/auth.ts',
    'server/api/auth/login.post.ts',
    'server/api/auth/verify.get.ts',
    'server/api/systems/users/index.get.ts',
    'server/api/systems/users/index.post.ts',
    'server/api/systems/users/page.get.ts',
    'server/api/systems/roles/index.get.ts',
    'server/api/systems/roles/index.post.ts',
    'server/api/systems/permissions/index.get.ts',
    'server/api/systems/permissions/index.post.ts',
    'server/api/systems/email-templates/index.get.ts',
    'server/api/systems/email-templates/index.post.ts',
    'server/api/systems/api-keys/index.get.ts',
    'server/api/systems/api-keys/index.post.ts',
    'server/api/systems/api-logs/page.get.ts',
    'server/api/systems/user-status-logs/page.get.ts',
    'server/api/systems/system/init.post.ts',
    'server/api/systems/settings.get.ts',
    'server/api/systems/settings.put.ts',
    'server/api/dashboard/stats.get.ts',
  ]

  for (const api of apiFiles) {
    it(`API endpoint exists: ${api}`, () => {
      expect(() => readFileSync(path.resolve(__dirname, `../${api}`), 'utf-8')).not.toThrow()
    })
  }
})
