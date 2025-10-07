import { getRepository } from "fireorm";
import { Role } from "../models/role";
import { PERMISSIONS } from "../middleware/permissions";

export async function initializeDefaultRoles() {
  try {
    const roleRepository = getRepository(Role);
    
    // Verificar si ya existen roles
    const existingRoles = await roleRepository.find();
    if (existingRoles.length > 0) {
      console.log('Los roles ya están inicializados');
      return;
    }

    console.log('Inicializando roles por defecto...');

    const defaultRoles = [
      {
        name: 'admin',
        description: 'Administrador del sistema con acceso completo',
        permissions: [
          PERMISSIONS.USER_CREATE.name,
          PERMISSIONS.USER_READ.name,
          PERMISSIONS.USER_UPDATE.name,
          PERMISSIONS.USER_DELETE.name,
          PERMISSIONS.USER_MANAGE_ROLES.name,
          PERMISSIONS.TABLE_CREATE.name,
          PERMISSIONS.TABLE_READ.name,
          PERMISSIONS.TABLE_UPDATE.name,
          PERMISSIONS.TABLE_DELETE.name,
          PERMISSIONS.RESERVATION_CREATE.name,
          PERMISSIONS.RESERVATION_READ.name,
          PERMISSIONS.RESERVATION_UPDATE.name,
          PERMISSIONS.RESERVATION_DELETE.name,
          PERMISSIONS.RESERVATION_MANAGE_ALL.name,
          PERMISSIONS.SYSTEM_VIEW_LOGS.name,
          PERMISSIONS.SYSTEM_MANAGE_SETTINGS.name,
          PERMISSIONS.SYSTEM_EXPORT_DATA.name
        ],
        isActive: true,
        hierarchyLevel: 5,
        createdBy: 'system',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'manager',
        description: 'Gerente con permisos de gestión',
        permissions: [
          PERMISSIONS.USER_READ.name,
          PERMISSIONS.USER_UPDATE.name,
          PERMISSIONS.TABLE_CREATE.name,
          PERMISSIONS.TABLE_READ.name,
          PERMISSIONS.TABLE_UPDATE.name,
          PERMISSIONS.TABLE_DELETE.name,
          PERMISSIONS.RESERVATION_CREATE.name,
          PERMISSIONS.RESERVATION_READ.name,
          PERMISSIONS.RESERVATION_UPDATE.name,
          PERMISSIONS.RESERVATION_DELETE.name,
          PERMISSIONS.RESERVATION_MANAGE_ALL.name,
          PERMISSIONS.SYSTEM_VIEW_LOGS.name
        ],
        isActive: true,
        hierarchyLevel: 4,
        createdBy: 'system',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'employee',
        description: 'Empleado con permisos operativos',
        permissions: [
          PERMISSIONS.TABLE_READ.name,
          PERMISSIONS.RESERVATION_CREATE.name,
          PERMISSIONS.RESERVATION_READ.name,
          PERMISSIONS.RESERVATION_UPDATE.name
        ],
        isActive: true,
        hierarchyLevel: 3,
        createdBy: 'system',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'customer',
        description: 'Cliente con permisos básicos',
        permissions: [
          PERMISSIONS.RESERVATION_CREATE.name,
          PERMISSIONS.RESERVATION_READ.name
        ],
        isActive: true,
        hierarchyLevel: 2,
        createdBy: 'system',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'guest',
        description: 'Invitado con acceso limitado',
        permissions: [],
        isActive: true,
        hierarchyLevel: 1,
        createdBy: 'system',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    for (const roleData of defaultRoles) {
      await roleRepository.create(roleData);
      console.log(`Rol '${roleData.name}' creado exitosamente`);
    }

    console.log('Roles inicializados correctamente');
  } catch (error) {
    console.error('Error inicializando roles:', error);
    throw error;
  }
}

export async function createCustomRole(roleData: {
  name: string;
  description: string;
  permissions: string[];
  hierarchyLevel: number;
  createdBy: string;
}) {
  try {
    const roleRepository = getRepository(Role);
    
    // Verificar que el nombre no exista
    const existingRole = await roleRepository
      .whereEqualTo("name", roleData.name)
      .find();
    
    if (existingRole.length > 0) {
      throw new Error(`Ya existe un rol con el nombre: ${roleData.name}`);
    }

    // Verificar que el nivel de jerarquía no esté ocupado
    const existingLevel = await roleRepository
      .whereEqualTo("hierarchyLevel", roleData.hierarchyLevel)
      .find();
    
    if (existingLevel.length > 0) {
      throw new Error(`Ya existe un rol con el nivel de jerarquía: ${roleData.hierarchyLevel}`);
    }

    const role = await roleRepository.create({
      ...roleData,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return role;
  } catch (error) {
    console.error('Error creando rol personalizado:', error);
    throw error;
  }
}

export async function updateRolePermissions(roleId: string, permissions: string[]) {
  try {
    const roleRepository = getRepository(Role);
    const role = await roleRepository.findById(roleId);
    
    if (!role) {
      throw new Error('Rol no encontrado');
    }

    role.permissions = permissions;
    role.updatedAt = new Date();
    
    await roleRepository.update(role);
    
    return role;
  } catch (error) {
    console.error('Error actualizando permisos del rol:', error);
    throw error;
  }
}

