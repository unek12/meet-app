import {ExecutionContext, Injectable} from '@nestjs/common';
import {AuthGuard} from '@nestjs/passport';
import {JwtService} from "@nestjs/jwt";
import * as process from "process";
import {UsersService} from "../modules/users/users.service";

@Injectable()
export class accessTokenWSGuard extends AuthGuard('jwt') {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UsersService
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToWs().getClient();
    const token = request.handshake.headers.get('authorization')?.replace('Bearer', '').trim();
    console.log(token)
    if (!token) {
      return false;
    }

    try {
      const decodedToken = await this.jwtService.verify(token, {secret: process.env['JWT_ACCESS_SECRET']});
      const user = await this.userService.findById(decodedToken.sub);
      if (user && user.refresh === token) {
        request.user = user;
        return true;
      }
    } catch (e) {
      return false
    }
    return false;
  }
}