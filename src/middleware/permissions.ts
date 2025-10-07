import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth';
import { getRepository } from 'fireorm';
import { Role } from '../models/role';

export interface Permission {
  name: string;
  description: string;
}

// Definición de permisos del sistema
export const PERMISSIONS = {
  // Permisos de usuarios
  USER_CREATE: { name: 'user:create', description: 'Crear usuarios' },
  USER_READ: { name: 'user:read', description: 'Ver usuarios' },
  USER_UPDATE: { name: 'user:update', description: 'Actualizar usuarios' },
  USER_DELETE: { name: 'user:delete', description: 'Eliminar usuarios' },
  USER_MANAGE_ROLES: { name: 'user:manage_roles', description: 'Gestionar roles de usuarios' },
  
  // Permisos de mesas
  TABLE_CREATE: { name: 'table:create', description: 'Crear mesas' },
  TABLE_READ: { name: 'table:read', description: 'Ver mesas' },
  TABLE_UPDATE: { name: 'table:update', description: 'Actualizar mesas' },
  TABLE_DELETE: { name: 'table:delete', description: 'Eliminar mesas' },
  
  // Permisos de reservaciones
  RESERVATION_CREATE: { name: 'reservation:create', description: 'Crear reservaciones' },
  RESERVATION_READ: { name: 'reservation:read', description: 'Ver reservaciones' },
  RESERVATION_UPDATE: { name: 'reservation:update', description: 'Actualizar reservaciones' },
  RESERVATION_DELETE: { name: 'reservation:delete', description: 'Eliminar reservaciones' },
  RESERVATION_MANAGE_ALL: { name: 'reservation:manage_all', description: 'Gestionar todas las reservaciones' },
  
  // Permisos de sistema
  SYSTEM_VIEW_LOGS: { name: 'system:view_logs', description: 'Ver logs del sistema' },
  SYSTEM_MANAGE_SETTINGS: { name: 'system:manage_settings', description: 'Gestionar configuraciones' },
  SYSTEM_EXPORT_DATA: { name: 'system:export_data', description: 'Exportar datos' }
} as const;

// Permisos por defecto para cada rol
export const DEFAULT_ROLE_PERMISSIONS: Record<string, string[]> = {
  admin: [
    PERMISSIONS.USER_CREATE.name,
    PERMISSIONS.USER_READ.name,
    PERMISSIONS.USER_UPDATE.name,
    PERMISSIONS.USER_DELETE.name,
    PERMISSIONS.USER_MANAGE_ROLES.name,
    PERMISSIONS.TABLE_CREATE.name,
    PERMISSIONS.TABLE_READ.name,
    PERMISSIONS.TABLE_UPDATE.name,
    PERMISSIONS.TABLE_DELETE.name,
    PERMISSIONS.RESERVATION_CREATE.name,
    PERMISSIONS.RESERVATION_READ.name,
    PERMISSIONS.RESERVATION_UPDATE.name,
    PERMISSIONS.RESERVATION_DELETE.name,
    PERMISSIONS.RESERVATION_MANAGE_ALL.name,
    PERMISSIONS.SYSTEM_VIEW_LOGS.name,
    PERMISSIONS.SYSTEM_MANAGE_SETTINGS.name,
    PERMISSIONS.SYSTEM_EXPORT_DATA.name
  ],
  manager: [
    PERMISSIONS.USER_READ.name,
    PERMISSIONS.USER_UPDATE.name,
    PERMISSIONS.TABLE_CREATE.name,
    PERMISSIONS.TABLE_READ.name,
    PERMISSIONS.TABLE_UPDATE.name,
    PERMISSIONS.TABLE_DELETE.name,
    PERMISSIONS.RESERVATION_CREATE.name,
    PERMISSIONS.RESERVATION_READ.name,
    PERMISSIONS.RESERVATION_UPDATE.name,
    PERMISSIONS.RESERVATION_DELETE.name,
    PERMISSIONS.RESERVATION_MANAGE_ALL.name,
    PERMISSIONS.SYSTEM_VIEW_LOGS.name
  ],
  employee: [
    PERMISSIONS.TABLE_READ.name,
    PERMISSIONS.RESERVATION_CREATE.name,
    PERMISSIONS.RESERVATION_READ.name,
    PERMISSIONS.RESERVATION_UPDATE.name
  ],
  customer: [
    PERMISSIONS.RESERVATION_CREATE.name,
    PERMISSIONS.RESERVATION_READ.name
  ],
  guest: []
};

export const requirePermission = (permission: string) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !req.userRole) {
      return res.status(401).json({ 
        message: 'Autenticación requerida',
        code: 'AUTH_REQUIRED'
      });
    }

    try {
      const userPermissions = req.user.permissions || [];
      const allUserPermissions = await getUserPermissions(req.userRole, userPermissions);

      if (!allUserPermissions.includes(permission)) {
        return res.status(403).json({ 
          message: `Permiso requerido: ${permission}`,
          code: 'PERMISSION_DENIED',
          requiredPermission: permission,
          userPermissions: allUserPermissions
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        message: 'Error verificando permisos',
        code: 'PERMISSION_CHECK_ERROR'
      });
    }
  };
};

export const requireAnyPermission = (permissions: string[]) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !req.userRole) {
      return res.status(401).json({ 
        message: 'Autenticación requerida',
        code: 'AUTH_REQUIRED'
      });
    }

    try {
      const userPermissions = req.user.permissions || [];
      const allUserPermissions = await getUserPermissions(req.userRole, userPermissions);

      const hasPermission = permissions.some(permission => 
        allUserPermissions.includes(permission)
      );

      if (!hasPermission) {
        return res.status(403).json({ 
          message: `Se requiere al menos uno de los siguientes permisos: ${permissions.join(', ')}`,
          code: 'PERMISSION_DENIED',
          requiredPermissions: permissions,
          userPermissions: allUserPermissions
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        message: 'Error verificando permisos',
        code: 'PERMISSION_CHECK_ERROR'
      });
    }
  };
};

export const requireAllPermissions = (permissions: string[]) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !req.userRole) {
      return res.status(401).json({ 
        message: 'Autenticación requerida',
        code: 'AUTH_REQUIRED'
      });
    }

    try {
      const userPermissions = req.user.permissions || [];
      const allUserPermissions = await getUserPermissions(req.userRole, userPermissions);

      const hasAllPermissions = permissions.every(permission => 
        allUserPermissions.includes(permission)
      );

      if (!hasAllPermissions) {
        const missingPermissions = permissions.filter(permission => 
          !allUserPermissions.includes(permission)
        );
        
        return res.status(403).json({ 
          message: `Permisos faltantes: ${missingPermissions.join(', ')}`,
          code: 'PERMISSION_DENIED',
          requiredPermissions: permissions,
          missingPermissions,
          userPermissions: allUserPermissions
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        message: 'Error verificando permisos',
        code: 'PERMISSION_CHECK_ERROR'
      });
    }
  };
};

// Función helper para obtener todos los permisos de un usuario (ahora dinámico)
export const getUserPermissions = async (userRole: string, customPermissions: string[] = []) => {
  try {
    const roleRepository = getRepository(Role);
    const role = await roleRepository
      .whereEqualTo("name", userRole)
      .whereEqualTo("isActive", true)
      .findOne();
    
    if (role) {
      return [...customPermissions, ...role.permissions];
    }
    
    // Fallback a permisos por defecto si no se encuentra el rol dinámico
    const defaultPermissions = DEFAULT_ROLE_PERMISSIONS[userRole] || [];
    return [...customPermissions, ...defaultPermissions];
  } catch (error) {
    console.error('Error obteniendo permisos dinámicos:', error);
    // Fallback a permisos por defecto en caso de error
    const defaultPermissions = DEFAULT_ROLE_PERMISSIONS[userRole] || [];
    return [...customPermissions, ...defaultPermissions];
  }
};

// Función helper para verificar si un usuario tiene un permiso específico (ahora dinámico)
export const hasPermission = async (userRole: string, customPermissions: string[] = [], permission: string) => {
  const allPermissions = await getUserPermissions(userRole, customPermissions);
  return allPermissions.includes(permission);
};

// Función para obtener roles dinámicos desde la base de datos
export const getDynamicRoles = async () => {
  try {
    const roleRepository = getRepository(Role);
    const roles = await roleRepository
      .whereEqualTo("isActive", true)
      .find();
    
    return roles.sort((a, b) => b.hierarchyLevel - a.hierarchyLevel);
  } catch (error) {
    console.error('Error obteniendo roles dinámicos:', error);
    return [];
  }
};

// Función para verificar si un rol existe y está activo
export const isRoleActive = async (roleName: string) => {
  try {
    const roleRepository = getRepository(Role);
    const role = await roleRepository
      .whereEqualTo("name", roleName)
      .whereEqualTo("isActive", true)
      .findOne();
    
    return !!role;
  } catch (error) {
    console.error('Error verificando rol:', error);
    return false;
  }
};
