import {
  IsNotEmpty,
  MaxLength,
} from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  username: string;
  @MaxLength(128)
  @IsNotEmpty()
  password: string;
}