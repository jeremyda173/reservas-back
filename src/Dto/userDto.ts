import { Exclude } from 'class-transformer';

export class CreateUserDto {
  id!: string;
  name!: string;
  email!: string;
  phone!: string;
  cedula!: string;
  image!: string;

  @Exclude()
  password_hash!: string;

  created_at!: Date;
  updated_at!: Date;
  gender!: "male" | "female" | "other";
  address!: string;
  role!: "admin" | "manager" | "employee" | "customer" | "guest";
  permissions!: string[];
}
