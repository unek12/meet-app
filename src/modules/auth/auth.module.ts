import {Module} from "@nestjs/common"
import {AuthService} from "./auth.service"
import {JwtModule} from '@nestjs/jwt';
import {ConfigService} from "@nestjs/config";
import {UsersService} from "../users/users.service";
import {AuthController} from "./auth.controller";
import {AccessTokenStrategy} from "./strategys/accessToken.strategy";
import {PrismaService} from "../prisma/prisma.service";
import {TokensService} from "../tokens/tokens.service";

@Module({
  imports: [
    JwtModule
  ],
  controllers: [AuthController],
  providers: [AuthService, AccessTokenStrategy, UsersService, PrismaService, TokensService],
})
export class AuthModule {
}