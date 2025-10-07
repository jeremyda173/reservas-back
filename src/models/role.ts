import { Collection } from "fireorm";

@Collection("Roles")
export class Role {
    id!: string;
    name!: string;
    description!: string;
    permissions!: string[];
    isActive!: boolean;
    hierarchyLevel!: number; // Nivel en la jerarquía (mayor número = más permisos)
    createdBy!: string; // ID del usuario que creó el rol
    createdAt!: Date;
    updatedAt!: Date;
    updatedBy?: string; // ID del usuario que actualizó el rol
}

