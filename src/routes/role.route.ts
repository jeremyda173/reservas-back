import { Router } from 'express';
import { RoleController } from '../controllers/role.controller';
import { authenticateToken } from '../middleware/auth';
import { requireAdmin, requireManager } from '../middleware/authorization';
import { requirePermission, PERMISSIONS } from '../middleware/permissions';
import { auditLogger, criticalActionLogger } from '../middleware/audit';
import { generalRateLimit, createRateLimit, adminRateLimit } from '../middleware/rateLimiting';
import { validateDto } from '../middleware/validation';
import { CreateRoleDto, UpdateRoleDto, AssignRoleDto } from '../Dto/roleDto';

const router = Router();
const controller = new RoleController();

// Crear nuevo rol (solo admin)
router.post(
  '/create',
  createRateLimit,
  authenticateToken,
  requireAdmin,
  requirePermission(PERMISSIONS.USER_MANAGE_ROLES.name),
  validateDto(CreateRoleDto),
  criticalActionLogger('ROLE_CREATE', 'role'),
  controller.createRole.bind(controller)
);

// Obtener todos los roles (público)
router.get(
  '/',
  generalRateLimit,
  auditLogger('ROLE_READ_ALL', 'role'),
  controller.getAllRoles.bind(controller)
);

// Endpoint público para pruebas (sin autenticación)
router.get(
  '/public',
  generalRateLimit,
  controller.getAllRoles.bind(controller)
);

// Obtener rol por ID (público)
router.get(
  '/:id',
  generalRateLimit,
  auditLogger('ROLE_READ_ONE', 'role'),
  controller.getRoleById.bind(controller)
);

// Actualizar rol (solo admin)
router.put(
  '/:id',
  generalRateLimit,
  authenticateToken,
  requireAdmin,
  requirePermission(PERMISSIONS.USER_MANAGE_ROLES.name),
  validateDto(UpdateRoleDto),
  criticalActionLogger('ROLE_UPDATE', 'role'),
  controller.updateRole.bind(controller)
);

// Eliminar rol (solo admin)
router.delete(
  '/:id',
  adminRateLimit,
  authenticateToken,
  requireAdmin,
  requirePermission(PERMISSIONS.USER_DELETE.name),
  criticalActionLogger('ROLE_DELETE', 'role'),
  controller.deleteRole.bind(controller)
);

// Asignar rol a usuario (público)
router.post(
  '/assign',
  generalRateLimit,
  validateDto(AssignRoleDto),
  auditLogger('ROLE_ASSIGN', 'role'),
  controller.assignRoleToUser.bind(controller)
);

// Obtener usuarios por rol (público)
router.get(
  '/:roleId/users',
  generalRateLimit,
  auditLogger('ROLE_GET_USERS', 'role'),
  controller.getUsersByRole.bind(controller)
);

// Desactivar/Activar rol (solo admin)
router.patch(
  '/:id/status',
  generalRateLimit,
  authenticateToken,
  requireAdmin,
  requirePermission(PERMISSIONS.USER_MANAGE_ROLES.name),
  auditLogger('ROLE_TOGGLE_STATUS', 'role'),
  controller.toggleRoleStatus.bind(controller)
);

// Obtener permisos disponibles (público)
router.get(
  '/permissions/available',
  generalRateLimit,
  auditLogger('ROLE_GET_PERMISSIONS', 'role'),
  controller.getAvailablePermissions.bind(controller)
);

export default router;
