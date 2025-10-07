import { Router, Request, Response } from 'express';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { requireAdmin } from '../middleware/authorization';
import { requirePermission, PERMISSIONS } from '../middleware/permissions';
import { auditLogger, getAuditLogs, getAuditStats } from '../middleware/audit';
import { adminRateLimit } from '../middleware/rateLimiting';

const router = Router();

// Obtener logs de auditoría
router.get(
  '/audit-logs',
  adminRateLimit,
  authenticateToken,
  requireAdmin,
  requirePermission(PERMISSIONS.SYSTEM_VIEW_LOGS.name),
  auditLogger('ADMIN_VIEW_AUDIT_LOGS', 'audit'),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const {
        userId,
        action,
        resource,
        status,
        startDate,
        endDate,
        limit = '50',
        offset = '0'
      } = req.query;

      const filters: any = {};
      if (userId) filters.userId = userId as string;
      if (action) filters.action = action as string;
      if (resource) filters.resource = resource as string;
      if (status) filters.status = status as string;
      if (startDate) filters.startDate = new Date(startDate as string);
      if (endDate) filters.endDate = new Date(endDate as string);
      if (limit) filters.limit = parseInt(limit as string);
      if (offset) filters.offset = parseInt(offset as string);

      const logs = getAuditLogs(filters);
      
      res.status(200).json({
        message: 'Logs de auditoría obtenidos exitosamente',
        data: logs,
        filters,
        total: logs.length
      });
    } catch (error) {
      res.status(500).json({
        message: 'Error al obtener logs de auditoría',
        error: error instanceof Error ? error.message : error
      });
    }
  }
);

// Obtener estadísticas de auditoría
router.get(
  '/audit-stats',
  adminRateLimit,
  authenticateToken,
  requireAdmin,
  requirePermission(PERMISSIONS.SYSTEM_VIEW_LOGS.name),
  auditLogger('ADMIN_VIEW_AUDIT_STATS', 'audit'),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const { startDate, endDate } = req.query;
      
      const start = startDate ? new Date(startDate as string) : undefined;
      const end = endDate ? new Date(endDate as string) : undefined;
      
      const stats = getAuditStats(start, end);
      
      res.status(200).json({
        message: 'Estadísticas de auditoría obtenidas exitosamente',
        data: stats
      });
    } catch (error) {
      res.status(500).json({
        message: 'Error al obtener estadísticas de auditoría',
        error: error instanceof Error ? error.message : error
      });
    }
  }
);

// Endpoint para obtener información del sistema
router.get(
  '/system-info',
  adminRateLimit,
  authenticateToken,
  requireAdmin,
  requirePermission(PERMISSIONS.SYSTEM_VIEW_LOGS.name),
  auditLogger('ADMIN_VIEW_SYSTEM_INFO', 'system'),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const systemInfo = {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        timestamp: new Date(),
        user: {
          id: req.userId,
          email: req.user?.email,
          role: req.userRole
        }
      };

      res.status(200).json({
        message: 'Información del sistema obtenida exitosamente',
        data: systemInfo
      });
    } catch (error) {
      res.status(500).json({
        message: 'Error al obtener información del sistema',
        error: error instanceof Error ? error.message : error
      });
    }
  }
);

export default router;

