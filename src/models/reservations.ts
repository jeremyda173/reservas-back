import { Collection } from "fireorm";

@Collection('Reservations')

export class Reservations{

    id!: string;

    user_Id!: string;

    date!: Date;

    start_Time!: Date;

    end_Time!: Date;

    status!: Date;

    created_at!: Date;
}