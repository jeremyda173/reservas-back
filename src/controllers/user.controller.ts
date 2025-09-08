import { getRepository } from "fireorm";
import { User } from "../models/user";
import { Request, Response } from 'express';
import { CreateUserDto } from "../Dto/userDto";
import jwt from 'jsonwebtoken';
import bcrypt from "bcryptjs"
import { instanceToPlain, plainToInstance } from "class-transformer";

export class userController { 

  //acceso a la coleccion
  private userRepository = getRepository(User);
  //crear usuarios
  async createUser(req: Request, res: Response):Promise <void> {
      try{
          //aplicar Dto
          const userDto: CreateUserDto = req.body;
          if (!userDto.email || !userDto.password_hash) {
              res.status(400).json({ message: 'Email y contraseña son obligatorios.' });
              return;
          }
          // validar Email existente
          const existingEmail = await this.userRepository.whereEqualTo('email', userDto.email).find()
          if (existingEmail.length > 0) res.status(400).json ({message: 'Usuario existente con este email', data: userDto})
          //obtener clave para el hash 
          const password = userDto.password_hash;
          //hashear la clave 
          const passwordHashed = await bcrypt.hash(password, 10)
          //guardar el hash 
          userDto.password_hash = passwordHashed;
          const user = await this.userRepository.create(userDto);
          //excluir la contraseña antes de enviar al front
          const userInstance = plainToInstance(CreateUserDto, user);
          const plainUser = instanceToPlain(userInstance);
          
          res.status(201).json({data: plainUser })
      }catch(err) { 
          res.status(500).json({message: 'Error al crear usuario', error: err});
      }
  }
async loginUser(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      res.status(400).json({ message: "Faltan campos obligatorios." });
      return;
    }

    const [user] = await this.userRepository.whereEqualTo("email", email).find();

    if (!user) {
      res.status(401).json({ message: "Credenciales inválidas" });
      return;
    }

    const passwordIsValid = await bcrypt.compare(password, user.password_hash);

    if (!passwordIsValid) {
      res.status(401).json({ message: "Credenciales inválidas" });
      return;
    }

    const token = jwt.sign({ id: user.id, email: user.email }, 'your-secret-key', { expiresIn: '1m' });
    const { password_hash, ...userData } = user;

    res.status(200).json({ message: "Inicio de sesión exitoso", user: userData, token });
  } catch (error) {
    res.status(500).json({ message: "Error en el login", error: error instanceof Error ? error.message : error });
  }
}

  async logoutUser(req: Request, res:Response): Promise <void>{
    try {
      res.clearCookie('token'); 
      res.status(200).json({ message: 'Sesión cerrada con éxito' });
    } catch (error) {
      res.status(500).json({ message: 'Error al cerrar sesión' });
    }
  }

  async getUser(req: Request, res:Response): Promise <void>{

    try{
      const allUser = await this.userRepository.find();

     const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const offset = (page - 1) * limit;
      const paginatedInventory = allUser.slice(offset, offset + limit);
      res.status(200).json({
        limit,
        page,
        total: allUser.length,
        data: paginatedInventory,
      }); 
      res.status(200).json(allUser)
    }catch(err){
      res.status(500).json({message: "Error al obtener usuarios", error: err})
    }    
  }

  async getUserById(req: Request, res: Response): Promise <void>{

    try{
      const user = await this.userRepository.findById(req.params.id);

      if (!user.id){
        res.status(404).json({message: "Usuario no encontrado."})
      }

      res.status(200).json(user)
    }catch(err){
      res.status(404).json({message: "Error al obtener usuario", error: err})
    }
  }

  async updateUser(req: Request, res: Response):Promise <void>{
    try{
      const user = await this.userRepository.findById(req.params.id);
      if (!user.id) {
      res.status(404).json({message: "No se encontró el usuario."})
      return;
      }    
      const updated = Object.assign(user, req.body);
      await this.userRepository.update(updated);
      res.status(200).json({message: "Usuario actualizado correctamente.", updated})
    }catch(err){
      res.status(500).json({message: "Error al actualizar el usuario", error: err})
    }
  }

  async deleteUser(req: Request, res: Response): Promise <void>{
    try {
      await this.userRepository.delete(req.params.id);
      res.status(200).send({message: "Usuario eliminado correctamente."});
    }catch(err) {
      res.status(500).json({message: "Error al eliminar el usuario", error: err})
    }
  }
}