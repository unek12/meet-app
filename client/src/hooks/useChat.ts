import { useCallback, useEffect, useMemo, useState } from "react";
import socket from '../socket';
import {useGetMessagesQuery} from "../services/meet";
import {User} from "../features/auth/authSlice";

type MessageInput = {
  message: string,
  roomID: string
}

type Message = {
  id: string,
  content: string,
  sender: User
}

export const useChat = (roomID: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [log, setLog] = useState<string>();
  const {data, isLoading} = useGetMessagesQuery({
    roomID: roomID
  });

  useEffect(() => {
    socket.on("messages", (message: Message) => {
      setMessages((prevState) => [...prevState, message]);
    });

    socket.emit("messages:get");
  }, []);

  useEffect(() => {
    console.log(data)
    if (!isLoading) {
      setMessages((prevState) => [...data.messages, ...prevState])
    }
  }, [isLoading]);

  const send = useCallback((payload: MessageInput) => {
    console.log(payload)
    socket.emit("message:post", payload);
  }, []);

  const update = useCallback((payload: MessageInput) => {
    socket.emit("message:put", payload);
  }, []);

  // const remove = useCallback((payload: Prisma.MessageWhereUniqueInput) => {
  //   socket.emit("message:delete", payload);
  // }, []);


  const chatActions = useMemo(
    () => ({
      send,
      update,
    }),
    []
  );

  return { messages, chatActions };
};
