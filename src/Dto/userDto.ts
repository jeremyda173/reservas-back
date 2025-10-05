import { Exclude } from 'class-transformer';
import { IsOptional, IsString, IsEmail, IsEnum, IsArray, IsDateString, IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  @IsOptional()
  @IsString()
  id!: string;

  @IsOptional()
  @IsString()
  name!: string;

  @IsEmail({}, { message: 'Email debe ser válido' })
  email!: string;

  @IsOptional()
  @IsString()
  phone!: string;

  @IsOptional()
  @IsString()
  cedula!: string;

  @IsOptional()
  @IsString()
  image!: string;

  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  @IsString()
  @Exclude()
  password_hash!: string;

  @IsOptional()
  @IsDateString()
  created_at!: Date;

  @IsOptional()
  @IsDateString()
  updated_at!: Date;

  @IsOptional()
  @IsEnum(['male', 'female', 'other'], { message: 'Género debe ser male, female u other' })
  gender!: "male" | "female" | "other";

  @IsOptional()
  @IsString()
  address!: string;

  @IsOptional()
  @IsEnum(['admin', 'manager', 'employee', 'customer', 'guest'], { 
    message: 'Rol debe ser admin, manager, employee, customer o guest' 
  })
  role!: "admin" | "manager" | "employee" | "customer" | "guest";

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissions!: string[];
}
