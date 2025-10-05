import { Router } from "express";
import { userController } from "../controllers/user.controller";
import { uploadSingleImage } from "../config/multer";

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

router.post(
  '/refresh-token',
  controller.refreshToken.bind(controller)
)

router.get(
    '/:id',
controller.getUserById.bind(controller))

router.patch(
    '/:id',
controller.updateUser.bind(controller))

// Ruta para subir imagen de usuario
router.post(
    '/:id/upload-image',
    uploadSingleImage,
    controller.uploadUserImage.bind(controller)
)

// Ruta para actualizar usuario con imagen
router.patch(
    '/:id/update-with-image',
    uploadSingleImage,
    controller.updateUserWithImage.bind(controller)
)

router.delete(
    '/:id',
controller.deleteUser.bind(controller))

export default router;
