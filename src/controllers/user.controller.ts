import { getRepository } from "fireorm";
import { User } from "../models/user";
import { Request, Response } from 'express';
import { CreateUserDto } from "../Dto/userDto";
import bcrypt from "bcryptjs"
import { error } from "console";
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
      
          const { password_hash, ...userData } = user;
      
          res.status(200).json({
            message: "Inicio de sesión exitoso",
            user: userData,
          });
      
        }catch (error) {
          console.error("Error en login:", error);
          res.status(500).json({
            message: "Error en el login",
            error: error instanceof Error ? error.message : error,
        });
    }
}   

}