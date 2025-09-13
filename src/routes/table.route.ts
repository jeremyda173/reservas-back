import { Router } from 'express';
import { TableController } from '../controllers/table.controller';

const router = Router();
const controller = new TableController();

// Crear mesa
router.post(
  '/create',
  controller.createTable.bind(controller)
);

// Obtener todas las mesas
router.get(
  '/',
  controller.getAllTables.bind(controller)
);

// Obtener una mesa por id
router.get(
  '/:id',
  controller.getTableById.bind(controller)
);

// Actualizar una mesa por id
router.put(
  '/:id',
  controller.updateTable.bind(controller)
);

// Eliminar una mesa por id
router.delete(
  '/:id',
  controller.deleteTables.bind(controller)
);

export default router;
