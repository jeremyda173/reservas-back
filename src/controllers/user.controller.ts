import { getRepository } from "fireorm";
import { User } from "../models/user";
import { Request, Response } from "express";
import { CreateUserDto } from "../Dto/userDto";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { instanceToPlain, plainToInstance } from "class-transformer";
import { pickFields } from "../utils";

export class userController {
  private userRepository = getRepository(User);

  async createUser(req: Request, res: Response): Promise<void> {
    try {
      const userDto: CreateUserDto = req.body;

      if (!userDto.email || !userDto.password_hash) {
        res.status(400).json({ message: "Email y contraseña son obligatorios." });
        return;
      }

      const existingEmail = await this.userRepository
        .whereEqualTo("email", userDto.email)
        .find();
      if (existingEmail.length > 0) {
        res
          .status(400)
          .json({ message: "Usuario existente con este email", data: userDto });
        return;
      }

      const password = userDto.password_hash;
      const passwordHashed = await bcrypt.hash(password, 10);
      userDto.password_hash = passwordHashed;

      const now = new Date();
      userDto.created_at = now;
      userDto.updated_at = now;
      userDto.role = userDto.role || "guest";
      userDto.permissions = userDto.permissions || [];
      userDto.gender = userDto.gender || "other";
      userDto.address = userDto.address || "";

      const user = await this.userRepository.create(userDto);
      const userInstance = plainToInstance(CreateUserDto, user);
      const plainUser = instanceToPlain(userInstance);

      res.status(201).json({ data: plainUser });
    } catch (err) {
      res.status(500).json({ message: "Error al crear usuario", error: err });
    }
  }

  async loginUser(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body;
    try {
      if (!email || !password) {
        res.status(400).json({ message: "Faltan campos obligatorios." });
        return;
      }

      const [user] = await this.userRepository
        .whereEqualTo("email", email)
        .find();

      if (!user) {
        res.status(401).json({ message: "Credenciales inválidas" });
        return;
      }

      const passwordIsValid = await bcrypt.compare(password, user.password_hash);

      if (!passwordIsValid) {
        res.status(401).json({ message: "Credenciales inválidas" });
        return;
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        "kkkall2ijfnnADFASNVACVPJEPQSVPBVPJFPIBQAVFPIQPEPAN",
        { expiresIn: "30m" }
      );

      const { password_hash, ...userData } = user;
      res
        .status(200)
        .json({ message: "Inicio de sesión exitoso", user: userData, token });
    } catch (error) {
      res.status(500).json({
        message: "Error en el login",
        error: error instanceof Error ? error.message : error,
      });
    }
  }

  async logoutUser(req: Request, res: Response): Promise<void> {
    try {
      res.clearCookie("token");
      res.status(200).json({ message: "Sesión cerrada con éxito" });
    } catch (error) {
      res.status(500).json({ message: "Error al cerrar sesión" });
    }
  }

  async getUser(req: Request, res: Response): Promise<void> {
    try {
      const allUser = await this.userRepository.find();

      const page = Math.max(parseInt(req.query.page as string) || 1, 1);
      const limit = Math.max(parseInt(req.query.limit as string) || 10, 1);
      const offset = (page - 1) * limit;

      const columnsRaw = (req.query.columns as string) || "";
      const requestedCols = columnsRaw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const ALLOWED = new Set([
        "id",
        "email",
        "name",
        "phone",
        "cedula",
        "image",
        "created_at",
        "updated_at",
        "role",
        "gender",
        "address",
        "permissions",
      ]);
      const safeCols = requestedCols.filter((c) => ALLOWED.has(c));

      const total = allUser.length;
      const pageSlice = allUser.slice(offset, offset + limit);

      const data = pageSlice.map((u) =>
        pickFields(u, safeCols.length ? safeCols : undefined)
      );

      res.status(200).json({
        page,
        limit,
        total,
        columns: safeCols.length ? safeCols : "all",
        data,
      });
    } catch (err) {
      res
        .status(500)
        .json({ message: "Error al obtener usuarios", error: err });
    }
  }

  async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const user = await this.userRepository.findById(req.params.id);

      if (!user.id) {
        res.status(404).json({ message: "Usuario no encontrado." });
        return;
      }

      res.status(200).json(user);
    } catch (err) {
      res
        .status(404)
        .json({ message: "Error al obtener usuario", error: err });
    }
  }

  async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const user = await this.userRepository.findById(req.params.id);
      if (!user.id) {
        res.status(404).json({ message: "No se encontró el usuario." });
        return;
      }

      const updated = Object.assign(user, req.body, { updated_at: new Date() });
      await this.userRepository.update(updated);

      res
        .status(200)
        .json({ message: "Usuario actualizado correctamente.", updated });
    } catch (err) {
      res
        .status(500)
        .json({ message: "Error al actualizar el usuario", error: err });
    }
  }

  async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      await this.userRepository.delete(req.params.id);
      res.status(200).send({ message: "Usuario eliminado correctamente." });
    } catch (err) {
      res
        .status(500)
        .json({ message: "Error al eliminar el usuario", error: err });
    }
  }
}
