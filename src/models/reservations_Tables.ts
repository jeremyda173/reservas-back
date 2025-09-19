import { Collection } from "fireorm";

@Collection("Reservations_Table")
export class ReservationsTable {
  id!: string;
  reservationId!: string;
  tableId!: string;
}
