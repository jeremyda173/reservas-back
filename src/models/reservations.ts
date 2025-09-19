import { Collection } from "fireorm";

export type ReservationStatus = "pendiente" | "confirmada" | "cancelada" | "completada";

@Collection("Reservations")
export class Reservations {
  id!: string;

  user_Id!: string;

  date!: Date;

  start_Time!: Date;

  end_Time!: Date;

  status!: ReservationStatus;;

  created_at!: Date;
}
