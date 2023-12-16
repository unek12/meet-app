import {BadRequestException, Injectable} from '@nestjs/common';
import {UsersService} from '../users/users.service';
import {AuthDto} from "./dto/auth.dto";
import {CreateUserDto} from "../users/dto/create-user.dto";
import * as argon2 from 'argon2';
import {PrismaService} from "../prisma/prisma.service";
import {User} from '@prisma/client';
import {TokensService} from "../tokens/tokens.service";

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private tokenService: TokensService
  ) {
  }

  async signUp(createUserDto: CreateUserDto) {
    // Check if user exists
    const userExists = await this.usersService.findByUsername(
      createUserDto.username,
    );
    if (userExists) {
      throw new BadRequestException('User already exists');
    }

    // Hash password
    const hash = await this.hashData(createUserDto.password);
    const user = await this.usersService.create({
      ...createUserDto,
      password: hash,
    });
    const tokens = await this.tokenService.getTokens(user.id, user.username);

    await this.usersService.updateRefreshToken(user.username, tokens.refreshToken)

    return {
      user,
      ...tokens
    };
  }

  async signIn(data: AuthDto) {
    const user = await this.usersService.findByUsername(data.username);
    if (!user) throw new BadRequestException('User does not exist');
    const passwordMatches = await argon2.verify(user.password, data.password);
    if (!passwordMatches)
      throw new BadRequestException('Password is incorrect');
    const tokens = await this.tokenService.getTokens(user.id, user.username);

    await this.usersService.updateRefreshToken(user.username, tokens.refreshToken)

    return {
      user,
      ...tokens
    };
  }

  hashData(data: string) {
    return argon2.hash(data);
  }

  async refreshTokens(user: User) {
    const tokens = await this.tokenService.getTokens(user.id, user.username);
    await this.usersService.updateRefreshToken(user.username, tokens.refreshToken)

    return {
      ...tokens
    };
  }
}
