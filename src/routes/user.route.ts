import { Router } from "express";
import { userController } from "../controllers/user.controller";
import { uploadSingleImage } from "../config/multer";
import { authenticateToken, optionalAuth } from "../middleware/auth";
import { requireAdmin, requireManager, requireOwnershipOrAdmin, requireOwnershipOrManager } from "../middleware/authorization";
import { requirePermission, PERMISSIONS } from "../middleware/permissions";
import { auditLogger, criticalActionLogger } from "../middleware/audit";
import { generalRateLimit, authRateLimit, createRateLimit } from "../middleware/rateLimiting";

const router = Router();

const controller = new userController();

// Rutas públicas (sin autenticación)
router.post(
    '/create',
    createRateLimit,
    auditLogger('USER_CREATE', 'user'),
    controller.createUser.bind(controller)
)

router.post(
    '/login',
    authRateLimit,
    auditLogger('USER_LOGIN', 'user'),
    controller.loginUser.bind(controller)
)

router.post(
    '/logout',
    optionalAuth,
    auditLogger('USER_LOGOUT', 'user'),
    controller.logoutUser.bind(controller)
)

router.post(
    '/refresh-token',
    authRateLimit,
    controller.refreshToken.bind(controller)
)

// Rutas públicas (sin autenticación)
router.get(
    '/',
    generalRateLimit,
    auditLogger('USER_READ_ALL', 'user'),
    controller.getUser.bind(controller)
)

router.get(
    '/:id',
    generalRateLimit,
    auditLogger('USER_READ_ONE', 'user'),
    controller.getUserById.bind(controller)
)

router.patch(
    '/:id',
    generalRateLimit,
    auditLogger('USER_UPDATE', 'user'),
    controller.updateUser.bind(controller)
)

// Ruta para subir imagen de usuario
router.post(
    '/:id/upload-image',
    generalRateLimit,
    uploadSingleImage,
    auditLogger('USER_UPLOAD_IMAGE', 'user'),
    controller.uploadUserImage.bind(controller)
)

// Ruta para actualizar usuario con imagen
router.patch(
    '/:id/update-with-image',
    generalRateLimit,
    uploadSingleImage,
    auditLogger('USER_UPDATE_WITH_IMAGE', 'user'),
    controller.updateUserWithImage.bind(controller)
)

router.delete(
    '/:id',
    generalRateLimit,
    authenticateToken,
    requireAdmin,
    requirePermission(PERMISSIONS.USER_DELETE.name),
    criticalActionLogger('USER_DELETE', 'user'),
    controller.deleteUser.bind(controller)
)

export default router;
