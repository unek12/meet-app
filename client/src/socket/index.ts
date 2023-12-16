import {io} from 'socket.io-client';

const socket = io('http://localhost:5000/meet', {
  forceNew: true,
  reconnectionAttempts: Infinity, // avoid having user reconnect manually in order to prevent dead clients after a server restart
  timeout : 10000, // before connect_error and connect_timeout are emitted.
  extraHeaders: {
    authorization: `Bearer ${localStorage.getItem('accessToken')}`
  }
});

export default socket;
