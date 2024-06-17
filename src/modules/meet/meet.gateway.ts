import {
  MessageBody,
  ConnectedSocket,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Namespace, Socket } from 'socket.io';
import { MeetService } from './meet.service';

@WebSocketGateway({
  namespace: 'meet',
})
export class MeetGateway implements OnGatewayConnection, OnGatewayInit {
  constructor(private meetService: MeetService) {}

  @WebSocketServer()
  server: Namespace;

  afterInit(): void {
    console.log(`Initialized Sockets Gateway!`);
  }

  // @UseGuards(accessTokenWSGuard)
  handleConnection(@ConnectedSocket() socket: any) {
    // if (socket.handshake.query['transport'] !== 'polling') {
    //
    // }
    // console.log(socket.handshake.headers['authorization'])
    // console.log(socket.handshake.query['transport'] === 'polling')
    // socket.disconnect()
  }

  getClientRooms(): string[] {
    const rooms = this.server.adapter.rooms;

    return Array.from(rooms.keys()).filter(
      (roomID) => this.validate(roomID) && this.version(roomID) === 4,
    );
  }

  shareRoomsInfo(): void {
    this.server.emit('share-rooms', {
      rooms: this.getClientRooms(),
    });
  }

  @SubscribeMessage('join')
  handleJoin(@ConnectedSocket() socket: any, @MessageBody() config: any) {
    const { room: roomID, isScreenShare, isVideoOn, isMicrophoneOn } = config;
    const joinedRooms = socket.rooms;
    console.log(config);
    if (Array.from(this.server.adapter.rooms.get(roomID) || []).length > 9) {
      return;
    }

    this.meetService
      .joinMeet({
        roomID,
        userId: socket.userId,
        socketId: socket.id,
        options: {
          isVideoOn,
          isMicrophoneOn,
        },
      })
      .then((meet) => {
        if (!meet) {
          return;
        }
        const clients = Array.from(
          this.server.adapter.rooms.get(roomID) || [],
        ).filter((clientID) => clientID !== socket.id);

        const joiningClientSettings = meet.participants.find(
          (item) => item.socketId === socket.id && item.isPresent,
        );
        clients.forEach((clientID) => {
          console.log(clientID);
          console.log(123);
          const clientSettings = meet.participants.find(
            (item) => item.socketId === clientID && item.isPresent,
          );
          console.log('clientSettings', clientSettings);

          this.server.to(clientID).emit('add-peer', {
            peerID: socket.id,
            createOffer: false,
            isScreenShare,
            isVideoOn: joiningClientSettings.isVideoOn,
            isMicrophoneOn: joiningClientSettings.isMicrophoneOn,
            avatar: joiningClientSettings.user.avatar,
            username: joiningClientSettings.user.username,
            name: joiningClientSettings.user.name,
          });

          socket.emit('add-peer', {
            peerID: clientID,
            createOffer: true,
            isScreenShare,
            isVideoOn: clientSettings.isVideoOn,
            isMicrophoneOn: clientSettings.isMicrophoneOn,
            avatar: clientSettings.user.avatar,
            username: clientSettings.user.username,
            name: clientSettings.user.name,
          });
        });

        if (!isScreenShare) socket.join(roomID);
      })
      .catch();

    // if (Array.from(joinedRooms).includes(roomID) && !isScreenShare) {
    //   console.warn(`Already joined to ${roomID}`);
    //   return;
    // }
    socket.on('disconnecting', () => {
      const { rooms } = socket;

      this.meetService
        .leaveMeet({
          roomID,
          userId: socket.userId,
          socketId: socket.id,
        })
        .then(() => {
          const clients = Array.from(
            this.server.adapter.rooms.get(roomID) || [],
          );
          clients.forEach((clientID) => {
            this.server.to(clientID).emit('remove-peer', {
              peerID: socket.id,
            });

            socket.emit('remove-peer', {
              peerID: clientID,
            });
          });

          socket.leave(roomID);
        })
        .catch(() => {});
    });
  }

  @SubscribeMessage('leave')
  handleLeave(@ConnectedSocket() socket: Socket, @MessageBody() config: any) {
    const rooms = socket.rooms;
    const isScreenShare = config?.isScreenShare;

    Array.from(rooms)
      // .filter((roomID: string) => this.validate(roomID) && this.version(roomID) === 4)
      .forEach((roomID: string) => {
        const clients = Array.from(this.server.adapter.rooms.get(roomID) || []);

        clients.forEach((clientID) => {
          this.server.to(clientID).emit('remove-peer', {
            peerID: socket.id,
            isScreenShare,
          });

          socket.emit('remove-peer', {
            peerID: clientID,
            isScreenShare,
          });
        });

        if (!isScreenShare) socket.leave(roomID);
      });
  }

  @SubscribeMessage('relay-sdp')
  handleRelaySdp(
    @ConnectedSocket() socket: Socket,
    @MessageBody() config: any,
  ) {
    const { peerID, sessionDescription, isScreenShare } = config;
    this.server.to(peerID).emit('session-description', {
      peerID: socket.id,
      sessionDescription,
      isScreenShare,
      from: socket.id,
    });
  }

  @SubscribeMessage('relay-ice')
  handleRelayIce(
    @ConnectedSocket() socket: Socket,
    @MessageBody() config: any,
  ) {
    const { peerID, iceCandidate, isScreenShare } = config;
    this.server.to(peerID).emit('ice-candidate', {
      peerID: socket.id,
      isScreenShare,
      iceCandidate,
      from: socket.id,
    });
  }

  @SubscribeMessage('toggle-options')
  handleMicToggle(@ConnectedSocket() socket: any, @MessageBody() config: any) {
    const { isMicrophoneOn, isVideoOn, roomID } = config;

    this.meetService
      .toggleOptions({
        roomID,
        socketId: socket.id,
        userId: socket.userId,
        options: {
          isMicrophoneOn,
          isVideoOn,
        },
      })
      .then((res) =>
        console.log(
          res.participants.find((item) => item.socketId === socket.id),
        ),
      );

    const clients = Array.from(this.server.adapter.rooms.get(roomID) || []);

    clients.forEach((client) => {
      this.server.to(client).emit('toggle-options', {
        peerID: socket.id,
        isMicrophoneOn,
        isVideoOn,
      });
    });
  }

  @SubscribeMessage('messages:get')
  handleMessage(@ConnectedSocket() socket: Socket) {
    socket.emit('messages:get', []);
  }

  @SubscribeMessage('message:post')
  handleSendMessage(
    @ConnectedSocket() socket: any,
    @MessageBody() options: any,
  ) {
    const { roomID, message } = options;

    this.meetService
      .saveMessage({ userId: socket.userId, ...options })
      .then((message) => {
        const clients = Array.from(this.server.adapter.rooms.get(roomID) || []);
        clients
          // .filter(clientID => clientID !== socket.id)
          .forEach((clientID) => {
            this.server.to(clientID).emit('messages', message);
          });
      });
  }

  private validate(roomID: string): boolean {
    // Implement your own validation logic for roomID if needed
    return true;
  }

  private version(roomID: string): number {
    // Implement your own version extraction logic from roomID if needed
    return 4;
  }
}
