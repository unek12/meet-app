import React, {useEffect} from 'react';
import {Button, Input, Layout, List} from "antd";
import {Content, Footer} from "antd/es/layout/layout";
import {useGetMessagesQuery} from "../../services/meet";
import {useParams} from "react-router";
import {User} from "../auth/authSlice";
import {useNavigate} from "react-router-dom";

type Message = {
  id: string,
  content: string,
  sender: User
}

export const ChatHistory = () => {
  const {id: roomID} = useParams();
  const nav = useNavigate()
  if (!roomID) {
    nav('/')
  }

  const {data, isLoading} = useGetMessagesQuery({
    roomID: roomID
  });

  useEffect(() => {
    console.log(data)
  }, [data]);

  return (
    <Layout>
      <Content style={{maxHeight: '100vh'}}>
        <List
          loading={isLoading}
          style={{
            overflowY: 'scroll', height: 'calc(100vh)'
          }}
        >
          {data &&
            <div>
              {data.messages.map((message: Message) =>
                <List.Item>
                  <List.Item.Meta
                    title={<div style={{ textAlign: 'left' }}>{message.sender.name || message.sender.username}</div>}
                    description={<div style={{ textAlign: 'left' }}>{message.content}</div>}
                  />
                </List.Item>,
              )}
              <Button
                onClick={() => {
                  nav(`/`)
                }}
                type={'primary'}
              >
                Главная
              </Button>
            </div>
          }
        </List>
      </Content>
    </Layout>
  )
};
