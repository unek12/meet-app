import {Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Req, UseGuards} from '@nestjs/common';
import { CreateUserDto } from "./dto/create-user.dto";
import { UsersService } from "./users.service";
import {accessTokenGuard} from "../../guards/accessToken.guard";
import {Request} from "express";
import {UpdateUserDto} from "./dto/update-user.dto";
import {AccessTokenStrategy} from "../auth/strategys/accessToken.strategy";

@Controller('api/users')
export class UsersController {
  constructor(private usersService: UsersService) {
  }

  @UseGuards(accessTokenGuard)
  @Get()
  getAll(@Req() req: Request) {
    console.log(req.query)
    return this.usersService.findAll()
  }

  @UseGuards(accessTokenGuard)
  @Post()
  create(@Body() createUser: CreateUserDto) {
    return this.usersService.create(createUser)
  }

  @UseGuards(accessTokenGuard)
  @Patch()
  update(@Req() req, @Body() updateUser: UpdateUserDto) {
    return this.usersService.updateUser(req.user.id, req.body as UpdateUserDto)
  }

  @UseGuards(accessTokenGuard)
  @Get(':id')
  getUser(@Param('id') id: string) {
    return this.usersService.findById(id)
  }
}
