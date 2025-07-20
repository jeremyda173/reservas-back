import { Collection } from "fireorm";

@Collection('Table')

export class Table {

    id!: string;

    number!: number;

    capacity!: number;

    location!: string;
}