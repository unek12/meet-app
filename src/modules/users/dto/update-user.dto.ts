import {
  IsNotEmpty,
  MaxLength,
} from 'class-validator';

export class UpdateUserDto {
  username: string
  name: string
  avatar: string
}