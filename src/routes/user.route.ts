import { Router } from "express";
import { userController } from "../controllers/user.controller";
import { request, response } from 'express'; 

const router = Router();

const controller = new userController();

router.post(
    '/create',
controller.createUser.bind(controller))

router.post(
    '/login',
controller.loginUser.bind(controller))

export default router;
