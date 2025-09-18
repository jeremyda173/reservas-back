import { Collection } from "fireorm";

@Collection("User")
export class User {
    id!: string;
    name!: string;
    email!: string;
    phone!: string;
    password_hash!: string;
    cedula!: string;
    image!: string;
    gender!: "male" | "female" | "other";
    address!: string;
    role!: "admin" | "manager" | "employee" | "customer" | "guest";
    permissions!: string[];
    created_at!: Date;
    updated_at!: Date;
}
