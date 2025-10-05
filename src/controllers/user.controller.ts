import { getRepository } from "fireorm";
import { User } from "../models/user";
import { Request, Response } from "express";
import { CreateUserDto } from "../Dto/userDto";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { instanceToPlain, plainToInstance } from "class-transformer";
import { validate } from "class-validator";

const JWT_SECRET = "kkkall2ijfnnADFASNVACVPJEPQSVPBVPJFPIBQAVFPIQPEPAN";

export class userController {
  private userRepository = getRepository(User);

  async createUser(req: Request, res: Response): Promise<void> {
    try {
      const userDto = plainToInstance(CreateUserDto, req.body);
      
      const errors = await validate(userDto);
      if (errors.length > 0) {
        const errorMessages = errors.map(error => {
          const constraints = error.constraints;
          return constraints ? Object.values(constraints)[0] : 'Error de validación';
        });
        
        res.status(400).json({ 
          message: "Error de validación", 
          errors: errorMessages 
        });
        return;
      }

      if (!userDto.email || !userDto.password_hash) {
        res.status(400).json({ message: "Email y contraseña son obligatorios." });
        return;
      }

      const existingEmail = await this.userRepository
        .whereEqualTo("email", userDto.email)
        .find();
      if (existingEmail.length > 0) {
        res.status(400).json({
          message: "Usuario existente con este email",
          data: userDto,
        });
        return;
      }

      const passwordHashed = await bcrypt.hash(userDto.password_hash, 10);
      userDto.password_hash = passwordHashed;

      const now = new Date();
      userDto.created_at = now;
      userDto.updated_at = now;
      userDto.role = userDto.role || "guest";
      userDto.permissions = userDto.permissions || [];
      userDto.gender = userDto.gender || "other";
      userDto.address = userDto.address || "";
      userDto.image = userDto.image || "";

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

      const accessToken = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: "20m" }
      );

      const refreshToken = jwt.sign({ id: user.id }, JWT_SECRET, {
        expiresIn: "20m",
      });

      const { password_hash, ...userData } = user;
      res.status(200).json({
        message: "Inicio de sesión exitoso",
        user: userData,
        accessToken,
        refreshToken,
      });
    } catch (error) {
      res.status(500).json({
        message: "Error en el login",
        error: error instanceof Error ? error.message : error,
      });
    }
  }

  async refreshToken(req: Request, res: Response): Promise<void> {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(401).json({ message: "Refresh token requerido" });
      return;
    }

    try {
      const payload = jwt.verify(refreshToken, JWT_SECRET) as any;

      const newAccessToken = jwt.sign(
        { id: payload.id, email: payload.email, role: payload.role },
        JWT_SECRET,
        { expiresIn: "20m" }
      );

      res.json({ accessToken: newAccessToken });
    } catch (error) {
      res
        .status(403)
        .json({ message: "Refresh token inválido o expirado", error });
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

      const total = allUser.length;
      const pageSlice = allUser.slice(offset, offset + limit);

      const data = pageSlice.map((u) => {
        if (!u.permissions) {
          u.permissions = [];
        }
        return u;
      });

      res.status(200).json({
        page,
        limit,
        total,
        data,
      });
    } catch (err) {
      res.status(500).json({ message: "Error al obtener usuarios", error: err });
    }
  }

  async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const user = await this.userRepository.findById(req.params.id);

      if (!user.id) {
        res.status(404).json({ message: "Usuario no encontrado." });
        return;
      }

      if (!user.permissions) {
        user.permissions = [];
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

  async uploadUserImage(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.id;
      
      if (!req.file) {
        res.status(400).json({ message: "No se proporcionó ninguna imagen" });
        return;
      }

      const user = await this.userRepository.findById(userId);
      if (!user.id) {
        res.status(404).json({ message: "Usuario no encontrado" });
        return;
      }

      const imagePath = `/uploads/users/${req.file.filename}`;
      user.image = imagePath;
      user.updated_at = new Date();

      await this.userRepository.update(user);

      res.status(200).json({
        message: "Imagen actualizada correctamente",
        imageUrl: imagePath,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image
        }
      });
    } catch (err) {
      res.status(500).json({ 
        message: "Error al subir la imagen", 
        error: err instanceof Error ? err.message : err 
      });
    }
  }

  async updateUserWithImage(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.id;
      const userData = req.body;
      
      const user = await this.userRepository.findById(userId);
      if (!user.id) {
        res.status(404).json({ message: "Usuario no encontrado" });
        return;
      }

      if (req.file) {
        userData.image = `/uploads/users/${req.file.filename}`;
      }

      const updated = Object.assign(user, userData, { updated_at: new Date() });
      await this.userRepository.update(updated);

      res.status(200).json({
        message: "Usuario actualizado correctamente",
        user: updated
      });
    } catch (err) {
      res.status(500).json({
        message: "Error al actualizar el usuario",
        error: err instanceof Error ? err.message : err
      });
    }
  }
}
