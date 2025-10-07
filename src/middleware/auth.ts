import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { getRepository } from 'fireorm';
import { User } from '../models/user';

const JWT_SECRET = "kkkall2ijfnnADFASNVACVPJEPQSVPBVPJFPIBQAVFPIQPEPAN";

export interface AuthenticatedRequest extends Request {
  user?: User;
  userId?: string;
  userRole?: string;
}

export const authenticateToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        message: 'Token de acceso requerido',
        code: 'TOKEN_REQUIRED'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const userRepository = getRepository(User);
    const user = await userRepository.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ 
        message: 'Usuario no encontrado',
        code: 'USER_NOT_FOUND'
      });
    }

    req.user = user;
    req.userId = user.id;
    req.userRole = user.role;

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ 
        message: 'Token expirado',
        code: 'TOKEN_EXPIRED'
      });
    }
    
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ 
        message: 'Token inválido',
        code: 'TOKEN_INVALID'
      });
    }

    return res.status(500).json({ 
      message: 'Error en la autenticación',
      code: 'AUTH_ERROR'
    });
  }
};

export const optionalAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      const userRepository = getRepository(User);
      const user = await userRepository.findById(decoded.id);

      if (user) {
        req.user = user;
        req.userId = user.id;
        req.userRole = user.role;
      }
    }

    next();
  } catch (error) {
    // Si hay error con el token opcional, continuamos sin autenticación
    next();
  }
};

