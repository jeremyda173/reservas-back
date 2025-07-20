import { Collection } from "fireorm";

@Collection('Admins')

export class Admins {

    id!: string;

    email!: string;

    password_hash!: string;

    role!: string;

    created_at!: Date;
}