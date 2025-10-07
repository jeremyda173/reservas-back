import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth';

export type Role = 'admin' | 'manager' | 'employee' | 'customer' | 'guest';

// Jerarquía de roles (mayor número = más permisos)
const roleHierarchy: Record<Role, number> = {
  'guest': 0,
  'customer': 1,
  'employee': 2,
  'manager': 3,
  'admin': 4
};

export const requireRole = (allowedRoles: Role | Role[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !req.userRole) {
      return res.status(401).json({ 
        message: 'Autenticación requerida',
        code: 'AUTH_REQUIRED'
      });
    }

    const userRole = req.userRole as Role;
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    if (!roles.includes(userRole)) {
      return res.status(403).json({ 
        message: `Acceso denegado. Se requiere uno de los siguientes roles: ${roles.join(', ')}`,
        code: 'INSUFFICIENT_ROLE',
        requiredRoles: roles,
        userRole: userRole
      });
    }

    next();
  };
};

export const requireMinimumRole = (minimumRole: Role) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !req.userRole) {
      return res.status(401).json({ 
        message: 'Autenticación requerida',
        code: 'AUTH_REQUIRED'
      });
    }

    const userRole = req.userRole as Role;
    const userLevel = roleHierarchy[userRole];
    const requiredLevel = roleHierarchy[minimumRole];

    if (userLevel < requiredLevel) {
      return res.status(403).json({ 
        message: `Acceso denegado. Se requiere rol mínimo: ${minimumRole}`,
        code: 'INSUFFICIENT_ROLE_LEVEL',
        requiredRole: minimumRole,
        userRole: userRole
      });
    }

    next();
  };
};

export const requireOwnershipOrRole = (allowedRoles: Role | Role[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !req.userRole) {
      return res.status(401).json({ 
        message: 'Autenticación requerida',
        code: 'AUTH_REQUIRED'
      });
    }

    const userRole = req.userRole as Role;
    const userId = req.userId;
    const resourceUserId = req.params.userId || req.params.id;

    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    // Si es el propietario del recurso, permitir acceso
    if (userId === resourceUserId) {
      return next();
    }

    // Si tiene uno de los roles permitidos, permitir acceso
    if (roles.includes(userRole)) {
      return next();
    }

    return res.status(403).json({ 
      message: 'Acceso denegado. Debe ser el propietario del recurso o tener permisos suficientes',
      code: 'ACCESS_DENIED',
      requiredRoles: roles,
      userRole: userRole
    });
  };
};

// Middlewares específicos para cada rol
export const requireAdmin = requireRole('admin');
export const requireManager = requireMinimumRole('manager');
export const requireEmployee = requireMinimumRole('employee');
export const requireCustomer = requireMinimumRole('customer');

// Middleware para acciones que requieren ser el propietario o tener roles específicos
export const requireOwnershipOrAdmin = requireOwnershipOrRole('admin');
export const requireOwnershipOrManager = requireOwnershipOrRole(['admin', 'manager']);
export const requireOwnershipOrEmployee = requireOwnershipOrRole(['admin', 'manager', 'employee']);

