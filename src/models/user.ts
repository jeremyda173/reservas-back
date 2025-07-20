import { Collection } from "fireorm";

@Collection('User')

export class User {
    id!: string;

    name!: string;

    email!: string;

    phone!: string; 

    password_hash!: string;

    created_at!: Date;
}