import { Router } from "express";
import { userController } from "../controllers/user.controller";


const router = Router();

const controller = new userController();

router.post(
    '/create',
controller.createUser.bind(controller))

router.post(
    '/login',
controller.loginUser.bind(controller))

router.post(
  '/logout',
  controller.logoutUser.bind(controller)
)

router.get(
    '/',
controller.getUser.bind(controller))

router.get(
    '/:id',
controller.getUserById.bind(controller))

router.patch(
    '/:id',
controller.updateUser.bind(controller))

router.delete(
    '/:id',
controller.deleteUser.bind(controller))

export default router;
