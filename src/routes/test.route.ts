import { Router, Request, Response } from 'express';
import { getRepository } from 'fireorm';
import { Role } from '../models/role';

const router = Router();

// Endpoint de prueba sin autenticación para verificar la estructura de datos
router.get('/roles-test', async (req: Request, res: Response) => {
  try {
    const roleRepository = getRepository(Role);
    const roles = await roleRepository.find();

    // Simular algunos roles de prueba si no existen
    if (roles.length === 0) {
      const testRoles = [
        {
          id: '1',
          name: 'admin',
          description: 'Administrador del sistema',
          permissions: ['user:create', 'user:read', 'user:update', 'user:delete'],
          isActive: true,
          hierarchyLevel: 5,
          createdBy: 'system',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '2',
          name: 'manager',
          description: 'Gerente',
          permissions: ['user:read', 'table:create', 'reservation:read'],
          isActive: true,
          hierarchyLevel: 4,
          createdBy: 'system',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '3',
          name: 'employee',
          description: 'Empleado',
          permissions: ['table:read', 'reservation:create'],
          isActive: true,
          hierarchyLevel: 3,
          createdBy: 'system',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      return res.status(200).json({
        message: 'Roles de prueba obtenidos exitosamente',
        data: {
          page: 1,
          limit: 10,
          total: testRoles.length,
          roles: testRoles
        }
      });
    }

    res.status(200).json({
      message: 'Roles obtenidos exitosamente',
      data: {
        page: 1,
        limit: 10,
        total: roles.length,
        roles: roles
      }
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error al obtener roles de prueba',
      error: error instanceof Error ? error.message : error
    });
  }
});

export default router;

