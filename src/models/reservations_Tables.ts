import { Collection } from "fireorm";

@Collection('Reservations_Table')

export class Reservations_Table {

    id!: string;

    reservation_id!: string;

    reservations?: string;

    table_id!: string;

    tables?: string; 
}