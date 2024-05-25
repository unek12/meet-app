import { Injectable } from '@nestjs/common';
import {JwtService} from "@nestjs/jwt";

@Injectable()
export class TokensService {
  constructor(
    private jwtService: JwtService
  ) {
  }
  async getTokens(userId: string, username: string) {
    const accessToken = await this.jwtService.signAsync(
      {
        sub: userId,
        username,
      },
      {
        // secret: this.configService.get<string>('JWT_ACCESS_SECRET') || 'secret key',
        secret: process.env['JWT_ACCESS_SECRET'] || 'secret key',
        expiresIn: '10d',
      },
    )

    const refreshToken = await this.jwtService.signAsync(
      {
        sub: userId,
        username,
      },
      {
        secret: process.env['JWT_ACCESS_SECRET'] || 'secret key',
        expiresIn: '10d',
      },
    )

    return {
      accessToken,
      refreshToken
    };
  }
}
