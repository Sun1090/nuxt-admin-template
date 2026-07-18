-- ============================================
-- Nuxt Admin Template - 系统初始化脚本
-- 用途：初始化权限、角色数据
-- 使用前请确保已执行数据库迁移（npm run db:push）
-- ============================================

-- 1. 清空相关表（如果已有数据）
TRUNCATE TABLE "Role_Permissions" CASCADE;
TRUNCATE TABLE "Role" CASCADE;
TRUNCATE TABLE "Permissions" CASCADE;

-- 2. 插入权限数据
INSERT INTO "Permissions" (id, name, remark, category, resource, action, created_at, updated_at) VALUES
-- 页面权限
(gen_random_uuid(), 'page:dashboard', '访问数据概览页面', 'page', NULL, NULL, NOW(), NOW()),
(gen_random_uuid(), 'page:users', '访问用户管理页面', 'page', NULL, NULL, NOW(), NOW()),
(gen_random_uuid(), 'page:roles', '访问角色管理页面', 'page', NULL, NULL, NOW(), NOW()),
(gen_random_uuid(), 'page:permissions', '访问权限管理页面', 'page', NULL, NULL, NOW(), NOW()),
(gen_random_uuid(), 'page:api_keys', '访问API密钥页面', 'page', NULL, NULL, NOW(), NOW()),
(gen_random_uuid(), 'page:settings', '访问系统设置页面', 'page', NULL, NULL, NOW(), NOW()),

-- 菜单权限
(gen_random_uuid(), 'menu:dashboard', '显示仪表盘菜单', 'menu', NULL, NULL, NOW(), NOW()),
(gen_random_uuid(), 'menu:user_mgmt', '显示用户管理菜单', 'menu', NULL, NULL, NOW(), NOW()),
(gen_random_uuid(), 'menu:role_mgmt', '显示角色管理菜单', 'menu', NULL, NULL, NOW(), NOW()),
(gen_random_uuid(), 'menu:permission_mgmt', '显示权限管理菜单', 'menu', NULL, NULL, NOW(), NOW()),
(gen_random_uuid(), 'menu:api_keys', '显示API密钥菜单', 'menu', NULL, NULL, NOW(), NOW()),
(gen_random_uuid(), 'menu:system_settings', '显示系统设置菜单', 'menu', NULL, NULL, NOW(), NOW()),
(gen_random_uuid(), 'menu:system_database', '显示数据库管理菜单', 'menu', NULL, NULL, NOW(), NOW()),

-- 功能权限
(gen_random_uuid(), 'feature:admin_access', '访问后台管理功能', 'feature', NULL, NULL, NOW(), NOW()),
(gen_random_uuid(), 'feature:export_data', '导出数据功能', 'feature', NULL, NULL, NOW(), NOW()),
(gen_random_uuid(), 'feature:import_data', '导入数据功能', 'feature', NULL, NULL, NOW(), NOW()),

-- 操作权限 - 用户管理
(gen_random_uuid(), 'action:user.create', '创建用户', 'action', 'user', 'create', NOW(), NOW()),
(gen_random_uuid(), 'action:user.read', '查看用户', 'action', 'user', 'read', NOW(), NOW()),
(gen_random_uuid(), 'action:user.update', '编辑用户', 'action', 'user', 'update', NOW(), NOW()),
(gen_random_uuid(), 'action:user.delete', '删除用户', 'action', 'user', 'delete', NOW(), NOW()),
(gen_random_uuid(), 'action:user.reset_password', '重置用户密码', 'action', 'user', 'reset_password', NOW(), NOW()),

-- 操作权限 - 角色管理
(gen_random_uuid(), 'action:role.create', '创建角色', 'action', 'role', 'create', NOW(), NOW()),
(gen_random_uuid(), 'action:role.read', '查看角色', 'action', 'role', 'read', NOW(), NOW()),
(gen_random_uuid(), 'action:role.update', '编辑角色', 'action', 'role', 'update', NOW(), NOW()),
(gen_random_uuid(), 'action:role.delete', '删除角色', 'action', 'role', 'delete', NOW(), NOW()),

-- 操作权限 - 权限管理
(gen_random_uuid(), 'action:permission.create', '创建权限', 'action', 'permission', 'create', NOW(), NOW()),
(gen_random_uuid(), 'action:permission.read', '查看权限', 'action', 'permission', 'read', NOW(), NOW()),
(gen_random_uuid(), 'action:permission.update', '编辑权限', 'action', 'permission', 'update', NOW(), NOW()),
(gen_random_uuid(), 'action:permission.delete', '删除权限', 'action', 'permission', 'delete', NOW(), NOW()),

-- 操作权限 - API密钥
(gen_random_uuid(), 'action:api_key.create', '创建API密钥', 'action', 'api_key', 'create', NOW(), NOW()),
(gen_random_uuid(), 'action:api_key.read', '查看API密钥', 'action', 'api_key', 'read', NOW(), NOW()),
(gen_random_uuid(), 'action:api_key.update', '编辑API密钥', 'action', 'api_key', 'update', NOW(), NOW()),
(gen_random_uuid(), 'action:api_key.delete', '删除API密钥', 'action', 'api_key', 'delete', NOW(), NOW());

-- 3. 插入角色数据
INSERT INTO "Role" (id, name, remark, is_superadmin, created_at, updated_at) VALUES
(gen_random_uuid(), '超级管理员', '系统最高权限管理员，拥有所有权限', true, NOW(), NOW()),
(gen_random_uuid(), '系统管理员', '系统管理员，拥有大部分管理权限', false, NOW(), NOW()),
(gen_random_uuid(), '普通用户', '普通用户，基础查看权限', false, NOW(), NOW());

-- 4. 为角色分配权限
-- 超级管理员 - 所有权限
INSERT INTO "Role_Permissions" (role_id, permission_id)
SELECT
  (SELECT id FROM "Role" WHERE name = '超级管理员'),
  id
FROM "Permissions";

-- 系统管理员 - 大部分管理权限（排除权限管理删除和角色删除）
INSERT INTO "Role_Permissions" (role_id, permission_id)
SELECT
  (SELECT id FROM "Role" WHERE name = '系统管理员'),
  id
FROM "Permissions"
WHERE name NOT LIKE 'action:permission.delete%'
  AND name NOT LIKE 'action:role.delete%';

-- 普通用户 - 基础查看权限
INSERT INTO "Role_Permissions" (role_id, permission_id)
SELECT
  (SELECT id FROM "Role" WHERE name = '普通用户'),
  id
FROM "Permissions"
WHERE name IN (
  'page:dashboard',
  'menu:dashboard',
  'feature:admin_access',
  'action:user.read',
  'action:role.read',
  'action:permission.read',
  'action:api_key.read');

-- 5. 插入默认系统设置
INSERT INTO "SystemSettings" ("enablePlayTimeSelection", "siteTitle", "createdAt", "updatedAt")
VALUES (false, 'Nuxt Admin Template', NOW(), NOW())
ON CONFLICT DO NOTHING;
