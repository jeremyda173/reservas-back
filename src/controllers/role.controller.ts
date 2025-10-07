import { getRepository } from "fireorm";
import { Role } from "../models/role";
import { Request, Response } from "express";
import { CreateRoleDto, UpdateRoleDto, AssignRoleDto, RoleQueryDto } from "../Dto/roleDto";
import { plainToInstance, instanceToPlain } from "class-transformer";
import { validate } from "class-validator";
import { getRepository as getUserRepository } from "fireorm";
import { User } from "../models/user";

export class RoleController {
  private roleRepository = getRepository(Role);
  private userRepository = getUserRepository(User);

  // Crear nuevo rol
  async createRole(req: Request, res: Response): Promise<void> {
    try {
      const roleDto = plainToInstance(CreateRoleDto, req.body);
      
      const errors = await validate(roleDto);
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

      // Verificar que el nombre del rol no exista
      const existingRole = await this.roleRepository
        .whereEqualTo("name", roleDto.name)
        .find();
      
      if (existingRole.length > 0) {
        res.status(400).json({
          message: "Ya existe un rol con este nombre",
          data: roleDto
        });
        return;
      }

      // Verificar que el nivel de jerarquía no esté ocupado
      const existingLevel = await this.roleRepository
        .whereEqualTo("hierarchyLevel", roleDto.hierarchyLevel)
        .find();
      
      if (existingLevel.length > 0) {
        res.status(400).json({
          message: "Ya existe un rol con este nivel de jerarquía",
          data: roleDto
        });
        return;
      }

      const now = new Date();
      const roleData = {
        ...roleDto,
        description: roleDto.description || '',
        permissions: roleDto.permissions || [],
        isActive: roleDto.isActive !== undefined ? roleDto.isActive : true,
        createdAt: now,
        updatedAt: now
      };

      const role = await this.roleRepository.create(roleData);
      const plainRole = instanceToPlain(role);

      res.status(201).json({ 
        message: "Rol creado exitosamente",
        data: plainRole 
      });
    } catch (err) {
      res.status(500).json({ 
        message: "Error al crear rol", 
        error: err instanceof Error ? err.message : err 
      });
    }
  }

  // Obtener todos los roles con filtros y paginación
  async getAllRoles(req: Request, res: Response): Promise<void> {
    try {
      const queryDto = plainToInstance(RoleQueryDto, req.query);
      let roles = await this.roleRepository.find();

      // Aplicar filtros
      if (queryDto.search) {
        const searchTerm = queryDto.search.toLowerCase();
        roles = roles.filter(role => 
          role.name.toLowerCase().includes(searchTerm) ||
          (role.description && role.description.toLowerCase().includes(searchTerm))
        );
      }

      if (queryDto.isActive !== undefined) {
        roles = roles.filter(role => role.isActive === queryDto.isActive);
      }

      if (queryDto.hierarchyLevel !== undefined) {
        roles = roles.filter(role => role.hierarchyLevel === queryDto.hierarchyLevel);
      }

      // Ordenar por nivel de jerarquía
      roles.sort((a, b) => b.hierarchyLevel - a.hierarchyLevel);

      // Aplicar paginación
      const page = Math.max(queryDto.page || 1, 1);
      const limit = Math.max(queryDto.limit || 10, 1);
      const offset = (page - 1) * limit;

      const total = roles.length;
      const paginatedRoles = roles.slice(offset, offset + limit);

      res.status(200).json({
        message: "Roles obtenidos exitosamente",
        data: {
          page,
          limit,
          total,
          roles: paginatedRoles
        }
      });
    } catch (err) {
      res.status(500).json({ 
        message: "Error al obtener roles", 
        error: err instanceof Error ? err.message : err 
      });
    }
  }

  // Obtener rol por ID
  async getRoleById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const role = await this.roleRepository.findById(id);

      if (!role || !role.id) {
        res.status(404).json({ 
          message: "Rol no encontrado" 
        });
        return;
      }

      res.status(200).json({
        message: "Rol obtenido exitosamente",
        data: role
      });
    } catch (err) {
      res.status(500).json({ 
        message: "Error al obtener rol", 
        error: err instanceof Error ? err.message : err 
      });
    }
  }

  // Actualizar rol
  async updateRole(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const roleDto = plainToInstance(UpdateRoleDto, req.body);
      
      const errors = await validate(roleDto);
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

      const existingRole = await this.roleRepository.findById(id);
      if (!existingRole || !existingRole.id) {
        res.status(404).json({ 
          message: "Rol no encontrado" 
        });
        return;
      }

      // Verificar nombre único si se está actualizando
      if (roleDto.name && roleDto.name !== existingRole.name) {
        const nameExists = await this.roleRepository
          .whereEqualTo("name", roleDto.name)
          .find();
        
        if (nameExists.length > 0) {
          res.status(400).json({
            message: "Ya existe un rol con este nombre"
          });
          return;
        }
      }

      // Verificar nivel de jerarquía único si se está actualizando
      if (roleDto.hierarchyLevel && roleDto.hierarchyLevel !== existingRole.hierarchyLevel) {
        const levelExists = await this.roleRepository
          .whereEqualTo("hierarchyLevel", roleDto.hierarchyLevel)
          .find();
        
        if (levelExists.length > 0) {
          res.status(400).json({
            message: "Ya existe un rol con este nivel de jerarquía"
          });
          return;
        }
      }

      const updatedRole = {
        ...existingRole,
        ...roleDto,
        updatedAt: new Date()
      };

      await this.roleRepository.update(updatedRole);

      res.status(200).json({
        message: "Rol actualizado exitosamente",
        data: updatedRole
      });
    } catch (err) {
      res.status(500).json({ 
        message: "Error al actualizar rol", 
        error: err instanceof Error ? err.message : err 
      });
    }
  }

  // Eliminar rol
  async deleteRole(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const role = await this.roleRepository.findById(id);
      if (!role || !role.id) {
        res.status(404).json({ 
          message: "Rol no encontrado" 
        });
        return;
      }

      // Verificar si hay usuarios usando este rol
      const usersWithRole = await this.userRepository
        .whereEqualTo("role", role.name)
        .find();

      if (usersWithRole.length > 0) {
        res.status(400).json({
          message: "No se puede eliminar el rol porque hay usuarios asignados a él",
          data: {
            roleName: role.name,
            usersCount: usersWithRole.length
          }
        });
        return;
      }

      await this.roleRepository.delete(id);

      res.status(200).json({
        message: "Rol eliminado exitosamente",
        data: {
          id,
          name: role.name
        }
      });
    } catch (err) {
      res.status(500).json({ 
        message: "Error al eliminar rol", 
        error: err instanceof Error ? err.message : err 
      });
    }
  }

  // Asignar rol a usuario
  async assignRoleToUser(req: Request, res: Response): Promise<void> {
    try {
      const assignDto = plainToInstance(AssignRoleDto, req.body);
      
      const errors = await validate(assignDto);
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

      // Verificar que el usuario existe
      const user = await this.userRepository.findById(assignDto.userId);
      if (!user || !user.id) {
        res.status(404).json({ 
          message: "Usuario no encontrado" 
        });
        return;
      }

      // Verificar que el rol existe
      const role = await this.roleRepository.findById(assignDto.roleId);
      if (!role || !role.id) {
        res.status(404).json({ 
          message: "Rol no encontrado" 
        });
        return;
      }

      // Verificar que el rol esté activo
      if (!role.isActive) {
        res.status(400).json({
          message: "No se puede asignar un rol inactivo"
        });
        return;
      }

      // Actualizar el usuario con el nuevo rol
      user.role = role.name as any;
      user.permissions = role.permissions;
      user.updated_at = new Date();

      await this.userRepository.update(user);

      res.status(200).json({
        message: "Rol asignado exitosamente",
        data: {
          userId: user.id,
          userName: user.name,
          roleName: role.name,
          permissions: role.permissions
        }
      });
    } catch (err) {
      res.status(500).json({ 
        message: "Error al asignar rol", 
        error: err instanceof Error ? err.message : err 
      });
    }
  }

  // Obtener usuarios por rol
  async getUsersByRole(req: Request, res: Response): Promise<void> {
    try {
      const { roleId } = req.params;
      
      const role = await this.roleRepository.findById(roleId);
      if (!role || !role.id) {
        res.status(404).json({ 
          message: "Rol no encontrado" 
        });
        return;
      }

      const users = await this.userRepository
        .whereEqualTo("role", role.name)
        .find();

      res.status(200).json({
        message: "Usuarios obtenidos exitosamente",
        data: {
          role: {
            id: role.id,
            name: role.name,
            description: role.description
          },
          users: users.map(user => ({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            permissions: user.permissions
          }))
        }
      });
    } catch (err) {
      res.status(500).json({ 
        message: "Error al obtener usuarios por rol", 
        error: err instanceof Error ? err.message : err 
      });
    }
  }

  // Desactivar/Activar rol
  async toggleRoleStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { isActive } = req.body;

      if (typeof isActive !== 'boolean') {
        res.status(400).json({
          message: "isActive debe ser un booleano"
        });
        return;
      }

      const role = await this.roleRepository.findById(id);
      if (!role || !role.id) {
        res.status(404).json({ 
          message: "Rol no encontrado" 
        });
        return;
      }

      role.isActive = isActive;
      role.updatedAt = new Date();

      await this.roleRepository.update(role);

      res.status(200).json({
        message: `Rol ${isActive ? 'activado' : 'desactivado'} exitosamente`,
        data: {
          id: role.id,
          name: role.name,
          isActive: role.isActive
        }
      });
    } catch (err) {
      res.status(500).json({ 
        message: "Error al cambiar estado del rol", 
        error: err instanceof Error ? err.message : err 
      });
    }
  }

  // Obtener permisos disponibles
  async getAvailablePermissions(req: Request, res: Response): Promise<void> {
    try {
      // Importar los permisos desde el middleware de permisos
      const { PERMISSIONS } = await import('../middleware/permissions');
      
      const permissions = Object.values(PERMISSIONS).map(permission => ({
        name: permission.name,
        description: permission.description
      }));

      res.status(200).json({
        message: "Permisos disponibles obtenidos exitosamente",
        data: permissions
      });
    } catch (err) {
      res.status(500).json({ 
        message: "Error al obtener permisos disponibles", 
        error: err instanceof Error ? err.message : err 
      });
    }
  }
}
