import { Router, Request, Response } from 'express';
import { initializeDefaultRoles } from '../utils/initializeRoles';

const router = Router();

// Endpoint para inicializar roles por defecto
router.post(
  '/initialize-roles',
  async (req: Request, res: Response) => {
    try {
      await initializeDefaultRoles();
      
      res.status(200).json({
        message: 'Roles inicializados exitosamente',
        data: {
          timestamp: new Date(),
          status: 'completed'
        }
      });
    } catch (error) {
      res.status(500).json({
        message: 'Error inicializando roles',
        error: error instanceof Error ? error.message : error
      });
    }
  }
);

export default router;

