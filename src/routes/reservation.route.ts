import { Router } from "express";
import { ReservationController } from "../controllers/reservation.controller";

const controller = new ReservationController()

const router = Router()
router.post(
    '/create', 
    controller.createReservation.bind(controller)
)
router.get(
    '/',
    controller.getAllReservations.bind(controller)
)
router.get(
    '/:id',
    controller.getReservationByID.bind(controller)
)
router.post(
    '/:id',
    controller.updateReservationByID.bind(controller)
)
router.delete(
    '/:id',
    controller.deleteReservationByID.bind(controller)
)

export default router;