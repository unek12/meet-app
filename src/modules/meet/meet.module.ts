import {Module} from '@nestjs/common';
import {ConfigModule} from '@nestjs/config';
import {MeetGateway} from "./meet.gateway";
import {MeetService} from "./meet.service";
import {PrismaService} from "../prisma/prisma.service";
import {UsersService} from "../users/users.service";
import {MeetController} from "./meet.controller";

@Module({
  imports: [ConfigModule],
  controllers: [MeetController],
  providers: [MeetService, MeetGateway, PrismaService, UsersService]
})
export class MeetModule {
}
