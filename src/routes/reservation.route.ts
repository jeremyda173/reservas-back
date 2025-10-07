import { Router } from "express";
import { ReservationController } from "../controllers/reservation.controller";
import { authenticateToken, optionalAuth } from "../middleware/auth";
import { requireAdmin, requireManager, requireEmployee, requireCustomer } from "../middleware/authorization";
import { requirePermission, PERMISSIONS } from "../middleware/permissions";
import { auditLogger, criticalActionLogger } from "../middleware/audit";
import { generalRateLimit, createRateLimit, adminRateLimit } from "../middleware/rateLimiting";

const controller = new ReservationController()

const router = Router()
// Crear reservación (público)
router.post(
    '/create',
    createRateLimit,
    auditLogger('RESERVATION_CREATE', 'reservation'),
    controller.createReservation.bind(controller)
)

// Obtener todas las reservaciones (público)
router.get(
    '/',
    generalRateLimit,
    auditLogger('RESERVATION_READ_ALL', 'reservation'),
    controller.getAllReservations.bind(controller)
)

// Obtener reservación por ID (público)
router.get(
    '/:id',
    generalRateLimit,
    auditLogger('RESERVATION_READ_ONE', 'reservation'),
    controller.getReservationByID.bind(controller)
)

// Actualizar reservación (público)
router.post(
    '/:id',
    generalRateLimit,
    auditLogger('RESERVATION_UPDATE', 'reservation'),
    controller.updateReservationByID.bind(controller)
)

// Eliminar reservación (público)
router.delete(
    '/:id',
    adminRateLimit,
    criticalActionLogger('RESERVATION_DELETE', 'reservation'),
    controller.deleteReservationByID.bind(controller)
)

export default router;