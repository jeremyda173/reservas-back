import { Exclude } from 'class-transformer';

export class CreateUserDto {
  id!: string;
  name!: string;
  email!: string;
  phone!: string;

  @Exclude()
  password_hash!: string;

  created_at!: Date;
}

