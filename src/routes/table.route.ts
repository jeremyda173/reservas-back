import { Router } from 'express';
import { TableController } from '../controllers/table.controller';
import { authenticateToken, optionalAuth } from '../middleware/auth';
import { requireAdmin, requireManager, requireEmployee } from '../middleware/authorization';
import { requirePermission, PERMISSIONS } from '../middleware/permissions';
import { auditLogger, criticalActionLogger } from '../middleware/audit';
import { generalRateLimit, createRateLimit, adminRateLimit } from '../middleware/rateLimiting';

const router = Router();
const controller = new TableController();

// Crear mesa (público)
router.post(
  '/create',
  createRateLimit,
  auditLogger('TABLE_CREATE', 'table'),
  controller.createTable.bind(controller)
);

// Obtener todas las mesas (acceso público)
router.get(
  '/',
  generalRateLimit,
  auditLogger('TABLE_READ_ALL', 'table'),
  controller.getAllTables.bind(controller)
);

// Obtener una mesa por id (acceso público)
router.get(
  '/:id',
  generalRateLimit,
  auditLogger('TABLE_READ_ONE', 'table'),
  controller.getTableById.bind(controller)
);

// Actualizar una mesa por id (público)
router.put(
  '/:id',
  generalRateLimit,
  auditLogger('TABLE_UPDATE', 'table'),
  controller.updateTable.bind(controller)
);

// Eliminar una mesa por id (público)
router.delete(
  '/:id',
  adminRateLimit,
  criticalActionLogger('TABLE_DELETE', 'table'),
  controller.deleteTables.bind(controller)
);

export default router;
