export type TableStatus = 'libre' | 'ocupada' | 'reservada' | 'mantenimiento';

// export interface Mesa {
//   id: string;
//   numero: number;
//   capacidad: number;
//   ubicacion: string;
//   estado?: TableStatus;
//   inicio?: string | Date;
//   horaReserva?: string;
//   consumo?: number;
//   cliente?: string;
//   mesero?: string;
//   notas?: string;
// }

export interface CreateTableDto {
  numero: number;
  capacidad: number;
  ubicacion: string;
  estado?: TableStatus;
  horaReserva?: string;
  cliente?: string;
  mesero?: string;
  notas?: string;
  consumo?: number;
  inicio?: string | Date;
}

export interface UpdateMesaDto extends Partial<CreateTableDto> {}
