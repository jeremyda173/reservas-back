import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth';

export interface AuditLog {
  id?: string;
  userId?: string;
  userEmail?: string;
  userRole?: string;
  action: string;
  resource: string;
  resourceId?: string;
  method: string;
  url: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
  details?: any;
  status: 'success' | 'failure' | 'error';
  errorMessage?: string;
}

// Simulamos una base de datos de logs (en producción usarías una BD real)
const auditLogs: AuditLog[] = [];

export const auditLogger = (action: string, resource: string) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const startTime = Date.now();
    
    // Capturar la respuesta original
    const originalSend = res.send;
    let responseBody: any;
    let statusCode = res.statusCode;

    res.send = function(body: any) {
      responseBody = body;
      statusCode = res.statusCode;
      return originalSend.call(this, body);
    };

    // Función para crear el log de auditoría
    const createAuditLog = async (status: 'success' | 'failure' | 'error', errorMessage?: string) => {
      const auditLog: AuditLog = {
        userId: req.userId,
        userEmail: req.user?.email,
        userRole: req.userRole,
        action,
        resource,
        resourceId: req.params.id,
        method: req.method,
        url: req.originalUrl,
        ipAddress: req.ip || req.connection.remoteAddress || req.socket.remoteAddress,
        userAgent: req.get('User-Agent'),
        timestamp: new Date(),
        details: {
          requestBody: req.method !== 'GET' ? req.body : undefined,
          queryParams: req.query,
          responseTime: Date.now() - startTime,
          responseSize: responseBody ? JSON.stringify(responseBody).length : 0
        },
        status,
        errorMessage
      };

      auditLogs.push(auditLog);
      
      // En producción, aquí guardarías en la base de datos
      console.log(`[AUDIT] ${status.toUpperCase()}: ${action} on ${resource}`, {
        user: auditLog.userEmail,
        role: auditLog.userRole,
        resource: auditLog.resource,
        method: auditLog.method,
        status: auditLog.status,
        responseTime: auditLog.details.responseTime
      });
    };

    // Interceptar el final de la respuesta
    res.on('finish', async () => {
      if (statusCode >= 200 && statusCode < 300) {
        await createAuditLog('success');
      } else if (statusCode >= 400 && statusCode < 500) {
        await createAuditLog('failure', `HTTP ${statusCode}`);
      } else {
        await createAuditLog('error', `HTTP ${statusCode}`);
      }
    });

    // Interceptar errores
    res.on('error', async (error) => {
      await createAuditLog('error', error.message);
    });

    next();
  };
};

// Middleware para logging de acciones críticas
export const criticalActionLogger = (action: string, resource: string) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const auditLog: AuditLog = {
      userId: req.userId,
      userEmail: req.user?.email,
      userRole: req.userRole,
      action,
      resource,
      resourceId: req.params.id,
      method: req.method,
      url: req.originalUrl,
      ipAddress: req.ip || req.connection.remoteAddress || req.socket.remoteAddress,
      userAgent: req.get('User-Agent'),
      timestamp: new Date(),
      details: {
        requestBody: req.body,
        queryParams: req.query,
        criticalAction: true
      },
      status: 'success'
    };

    auditLogs.push(auditLog);
    
    console.log(`[CRITICAL ACTION] ${action} on ${resource}`, {
      user: auditLog.userEmail,
      role: auditLog.userRole,
      resource: auditLog.resource,
      timestamp: auditLog.timestamp
    });

    next();
  };
};

// Función para obtener logs de auditoría
export const getAuditLogs = (filters?: {
  userId?: string;
  action?: string;
  resource?: string;
  status?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}) => {
  let filteredLogs = [...auditLogs];

  if (filters) {
    if (filters.userId) {
      filteredLogs = filteredLogs.filter(log => log.userId === filters.userId);
    }
    if (filters.action) {
      filteredLogs = filteredLogs.filter(log => log.action === filters.action);
    }
    if (filters.resource) {
      filteredLogs = filteredLogs.filter(log => log.resource === filters.resource);
    }
    if (filters.status) {
      filteredLogs = filteredLogs.filter(log => log.status === filters.status);
    }
    if (filters.startDate) {
      filteredLogs = filteredLogs.filter(log => log.timestamp >= filters.startDate!);
    }
    if (filters.endDate) {
      filteredLogs = filteredLogs.filter(log => log.timestamp <= filters.endDate!);
    }

    // Ordenar por timestamp descendente
    filteredLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    // Aplicar paginación
    const offset = filters.offset || 0;
    const limit = filters.limit || 50;
    filteredLogs = filteredLogs.slice(offset, offset + limit);
  }

  return filteredLogs;
};

// Función para obtener estadísticas de auditoría
export const getAuditStats = (startDate?: Date, endDate?: Date) => {
  let logs = [...auditLogs];

  if (startDate) {
    logs = logs.filter(log => log.timestamp >= startDate);
  }
  if (endDate) {
    logs = logs.filter(log => log.timestamp <= endDate);
  }

  const stats = {
    total: logs.length,
    byStatus: {
      success: logs.filter(log => log.status === 'success').length,
      failure: logs.filter(log => log.status === 'failure').length,
      error: logs.filter(log => log.status === 'error').length
    },
    byAction: logs.reduce((acc, log) => {
      acc[log.action] = (acc[log.action] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    byResource: logs.reduce((acc, log) => {
      acc[log.resource] = (acc[log.resource] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    byUser: logs.reduce((acc, log) => {
      const key = `${log.userEmail} (${log.userRole})`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  };

  return stats;
};

// Exportar la lista de logs para acceso externo
export { auditLogs };

