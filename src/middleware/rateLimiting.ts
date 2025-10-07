import { Request, Response, NextFunction } from 'express';

interface RateLimitConfig {
  windowMs: number; // Ventana de tiempo en ms
  maxRequests: number; // Máximo número de requests
  message?: string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

// Almacén en memoria (en producción usar Redis)
const store: RateLimitStore = {};

export const rateLimiter = (config: RateLimitConfig) => {
  const {
    windowMs,
    maxRequests,
    message = 'Demasiadas solicitudes, intente más tarde',
    skipSuccessfulRequests = false,
    skipFailedRequests = false
  } = config;

  return (req: Request, res: Response, next: NextFunction) => {
    // Generar clave única para el cliente
    const key = `${req.ip}-${req.path}`;
    const now = Date.now();
    
    // Limpiar entradas expiradas
    Object.keys(store).forEach(k => {
      if (store[k].resetTime < now) {
        delete store[k];
      }
    });

    // Obtener o crear entrada para este cliente
    if (!store[key]) {
      store[key] = {
        count: 0,
        resetTime: now + windowMs
      };
    }

    const clientData = store[key];

    // Si la ventana de tiempo ha expirado, resetear
    if (now >= clientData.resetTime) {
      clientData.count = 0;
      clientData.resetTime = now + windowMs;
    }

    // Verificar si ha excedido el límite
    if (clientData.count >= maxRequests) {
      const resetTimeInSeconds = Math.ceil((clientData.resetTime - now) / 1000);
      
      res.set({
        'X-RateLimit-Limit': maxRequests.toString(),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': new Date(clientData.resetTime).toISOString()
      });

      return res.status(429).json({
        message,
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: resetTimeInSeconds,
        limit: maxRequests,
        resetTime: new Date(clientData.resetTime).toISOString()
      });
    }

    // Incrementar contador
    clientData.count++;

    // Configurar headers de rate limit
    const remaining = Math.max(0, maxRequests - clientData.count);
    res.set({
      'X-RateLimit-Limit': maxRequests.toString(),
      'X-RateLimit-Remaining': remaining.toString(),
      'X-RateLimit-Reset': new Date(clientData.resetTime).toISOString()
    });

    // Interceptar respuesta para decidir si contar la request
    const originalSend = res.send;
    res.send = function(body: any) {
      const shouldCount = 
        (res.statusCode < 400 && !skipSuccessfulRequests) ||
        (res.statusCode >= 400 && !skipFailedRequests);

      if (!shouldCount) {
        clientData.count--;
      }

      return originalSend.call(this, body);
    };

    next();
  };
};

// Configuraciones predefinidas
export const rateLimitConfigs = {
  // Límite general para todas las rutas
  general: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    maxRequests: 100,
    message: 'Demasiadas solicitudes desde esta IP, intente más tarde'
  },

  // Límite estricto para login
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    maxRequests: 5,
    message: 'Demasiados intentos de login, intente más tarde',
    skipSuccessfulRequests: true
  },

  // Límite para creación de recursos
  create: {
    windowMs: 60 * 60 * 1000, // 1 hora
    maxRequests: 10,
    message: 'Demasiadas creaciones de recursos, intente más tarde'
  },

  // Límite para operaciones de administración
  admin: {
    windowMs: 60 * 1000, // 1 minuto
    maxRequests: 30,
    message: 'Demasiadas operaciones administrativas, intente más tarde'
  },

  // Límite para búsquedas y consultas
  search: {
    windowMs: 60 * 1000, // 1 minuto
    maxRequests: 60,
    message: 'Demasiadas consultas, intente más tarde'
  }
};

// Middlewares preconfigurados
export const generalRateLimit = rateLimiter(rateLimitConfigs.general);
export const authRateLimit = rateLimiter(rateLimitConfigs.auth);
export const createRateLimit = rateLimiter(rateLimitConfigs.create);
export const adminRateLimit = rateLimiter(rateLimitConfigs.admin);
export const searchRateLimit = rateLimiter(rateLimitConfigs.search);

// Rate limiting dinámico basado en roles
export const roleBasedRateLimit = (req: any, res: Response, next: NextFunction) => {
  const userRole = req.userRole;
  
  let config: RateLimitConfig;
  
  switch (userRole) {
    case 'admin':
      config = {
        windowMs: 60 * 1000, // 1 minuto
        maxRequests: 100,
        message: 'Límite de requests excedido'
      };
      break;
    case 'manager':
      config = {
        windowMs: 60 * 1000, // 1 minuto
        maxRequests: 50,
        message: 'Límite de requests excedido'
      };
      break;
    case 'employee':
      config = {
        windowMs: 60 * 1000, // 1 minuto
        maxRequests: 30,
        message: 'Límite de requests excedido'
      };
      break;
    case 'customer':
      config = {
        windowMs: 60 * 1000, // 1 minuto
        maxRequests: 20,
        message: 'Límite de requests excedido'
      };
      break;
    default:
      config = {
        windowMs: 60 * 1000, // 1 minuto
        maxRequests: 10,
        message: 'Límite de requests excedido'
      };
  }

  return rateLimiter(config)(req, res, next);
};

