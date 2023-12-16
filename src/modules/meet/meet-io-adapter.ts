import {Logger, INestApplicationContext} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {JwtService} from '@nestjs/jwt';
import {IoAdapter} from '@nestjs/platform-socket.io';
import {ServerOptions, Server} from 'socket.io';
import {SocketWithAuth} from "../../types";

export class MeetIoAdapter extends IoAdapter {
  private readonly logger = new Logger(MeetIoAdapter.name);
  constructor(private app: INestApplicationContext, private configService: ConfigService) {
    super(app);
  }

  createIOServer(port: number, options?: ServerOptions) {
    const cors = {
      origin: '*',
      credentials: true
    };

    const optionsWithCORS: ServerOptions = {
      ...options,
      cors
    };

    const jwtService = this.app.get(JwtService);
    const server: Server = super.createIOServer(port, optionsWithCORS);
    server
      .of('meet')
      .use(createTokenMiddleware(jwtService, this.configService, this.logger));

    return server;
  }
}

const createTokenMiddleware = (jwtService: JwtService, configService: ConfigService, logger: Logger) =>
  (socket: any, next) => {
  const token = socket.handshake.auth.token || socket.handshake.headers['authorization'];
  logger.debug(`Validation auth token before connection: ${token}`);

  try {
    const payload = jwtService.verify(token.replace('Bearer', '').trim(), {
      secret: configService.get('JWT_ACCESS_SECRET')
    });
    socket.userId = payload.sub;
    next();
  } catch (e) {
    logger.debug(e)
    next(new Error('FORBIDDEN'));
  }
};
