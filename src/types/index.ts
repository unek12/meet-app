import {Socket} from "socket.io";

export type AuthPayload = {
  roomID: string;
  userId: string;
};

export type RequestWithAuth = Request & AuthPayload;
export type SocketWithAuth = Socket & AuthPayload;