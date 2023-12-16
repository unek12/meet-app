import {
  Body,
  Controller, Get,
  Post, Req, UseGuards,
} from '@nestjs/common';
import {AuthService} from './auth.service';
import {AuthDto} from './dto/auth.dto';
import {CreateUserDto} from "../users/dto/create-user.dto";
import {accessTokenGuard} from "../../guards/accessToken.guard";
import {refreshTokenGuard} from "../../guards/refreshToken.guard";
import {UsersService} from "../users/users.service";

@Controller('api/auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService
  ) {
  }
  @Post('signup')
  signup(@Body() createUserDto: CreateUserDto) {
    return this.authService.signUp(createUserDto);
  }
  @Post('signin')
  signin(@Body() data: AuthDto) {
    return this.authService.signIn(data);
  }
  @UseGuards(refreshTokenGuard)
  @Get('refresh')
  refresh(@Req() req) {
    return this.authService.refreshTokens(req.user)
  }

  @UseGuards(accessTokenGuard)
  @Get('profile')
  profile(@Req() req) {
    return this.usersService.findById(req.user.id)
  }

  // @UseGuards(TokenGuard)
  // @Get('logout')
  // logout(@Req() req: Request) {
  //   this.authService.logout(req.user['sub']);
  // }
}
