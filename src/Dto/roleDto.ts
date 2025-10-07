import { IsOptional, IsString, IsArray, IsBoolean, IsNumber, IsNotEmpty, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateRoleDto {
  @IsNotEmpty({ message: 'El nombre del rol es obligatorio' })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  name!: string;

  @IsOptional()
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  description?: string;

  @IsOptional()
  @IsArray({ message: 'Los permisos deben ser un array' })
  @IsString({ each: true, message: 'Cada permiso debe ser una cadena de texto' })
  permissions?: string[];

  @IsOptional()
  @IsBoolean({ message: 'isActive debe ser un booleano' })
  isActive?: boolean;

  @IsNotEmpty({ message: 'El nivel de jerarquía es obligatorio' })
  @IsNumber({}, { message: 'El nivel de jerarquía debe ser un número' })
  @Type(() => Number)
  hierarchyLevel!: number;

  @IsNotEmpty({ message: 'El ID del creador es obligatorio' })
  @IsString({ message: 'El ID del creador debe ser una cadena de texto' })
  createdBy!: string;
}

export class UpdateRoleDto {
  @IsOptional()
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  name?: string;

  @IsOptional()
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  description?: string;

  @IsOptional()
  @IsArray({ message: 'Los permisos deben ser un array' })
  @IsString({ each: true, message: 'Cada permiso debe ser una cadena de texto' })
  permissions?: string[];

  @IsOptional()
  @IsBoolean({ message: 'isActive debe ser un booleano' })
  isActive?: boolean;

  @IsOptional()
  @IsNumber({}, { message: 'El nivel de jerarquía debe ser un número' })
  @Type(() => Number)
  hierarchyLevel?: number;

  @IsOptional()
  @IsString({ message: 'El ID del actualizador debe ser una cadena de texto' })
  updatedBy?: string;
}

export class AssignRoleDto {
  @IsNotEmpty({ message: 'El ID del usuario es obligatorio' })
  @IsString({ message: 'El ID del usuario debe ser una cadena de texto' })
  userId!: string;

  @IsNotEmpty({ message: 'El ID del rol es obligatorio' })
  @IsString({ message: 'El ID del rol debe ser una cadena de texto' })
  roleId!: string;

  @IsOptional()
  @IsString({ message: 'El ID del asignador debe ser una cadena de texto' })
  assignedBy?: string;
}

export class RoleQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isActive?: boolean;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  hierarchyLevel?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  page?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit?: number;
}

