import {Module} from '@nestjs/common';
import {PrismaModule} from "./modules/prisma/prisma.module";
import {AuthModule} from "./modules/auth/auth.module";
import {ConfigModule} from "@nestjs/config";
import {JwtModule} from "@nestjs/jwt";
import {MeetModule} from "./modules/meet/meet.module";
import {AppController} from './app.controller';
import {MulterModule} from "@nestjs/platform-express";
import { join } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';
import {UsersModule} from "./modules/users/users.module";

@Module({
  imports: [
    ConfigModule.forRoot(),
    PrismaModule,
    AuthModule,
    JwtModule,
    MeetModule,
    UsersModule,
    MulterModule.register({
      dest: './static/images',
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'static'),
      serveRoot: '/api/static'
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'client', 'build'),
    }),
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {
}
