import { Router } from 'express';
import { TableController } from '../controllers/table.controller';

const router = Router()

const controller = new TableController();

//Crear mesa
router.post(
    '/create',
    controller.createTable.bind(controller)
)
//Obtener todas las mesas
router.get(
    '/',
    controller.getAllTables.bind(controller)
)

export default router;