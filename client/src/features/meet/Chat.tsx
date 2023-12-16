import React, {useState} from 'react';
import {useChat} from "../../hooks/useChat";
import {useAuth} from "../../hooks/useAuth";
import {Button, Input, Layout, List} from "antd";
import {Content, Footer} from 'antd/es/layout/layout';

const Chat = ({roomID}: { roomID: string }) => {
  const [message, setMessage] = useState('')
  const user = useAuth()
  const {messages, chatActions} = useChat(roomID)

  const handleSend = () => {
    if (!message) return
    chatActions.send({message: message, roomID})
    setMessage('')
  }

  const handleChange = (e: React.FormEvent<HTMLInputElement>) => setMessage(e.currentTarget.value)

  return (

    <Layout>
      <Content style={{padding: '0 16px', marginBottom: 64, maxHeight: '100vh'}}>
        <List style={{
          overflowY: 'scroll', height: 'calc(100vh - 66px)'
        }}>
          {messages &&
            messages.map(message =>
              // <div key={message.id}>
              //   id: {message.sender.username}<br/>message: {message.content}
              // </div>
              <List.Item>
                <List.Item.Meta
                  title={<div style={{textAlign: 'left'}}>{message.sender.username}</div>}
                  description={<div style={{textAlign: 'left'}}>{message.content}</div>}
                />
              </List.Item>
            )

          }
        </List>
      </Content>
      <Footer style={{
        position: 'fixed',
        display: 'flex',
        bottom: 0,
        width: '30vw',
        padding: '16px',
        borderTop: '1px solid #e8e8e8',
        background: '#fff'
      }}>
        <Input onKeyDown={(e) => {
          if (e.key === 'Enter') handleSend()
        }} placeholder="Введите сообщение" value={message} onChange={handleChange} style={{marginRight: 8}}/>
        <Button
          type="primary"
          onClick={handleSend}
        >
          Отправить
        </Button>
      </Footer>
    </Layout>
  );
};

export default Chat;
