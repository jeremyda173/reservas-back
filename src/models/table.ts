import { Collection } from "fireorm";

export type TableStatus = "libre" | "ocupada" | "reservada" | "mantenimiento";

@Collection("tables")
export class Table {
  id!: string;
  idNum!: number;
  numero!: number;
  capacidad!: number;
  ubicacion!: string;
  estado?: TableStatus;
  horaReserva?: string;
  cliente?: string;
  mesero?: string;
  notas?: string;
  consumo?: number;
  inicio?: string | Date;
}
