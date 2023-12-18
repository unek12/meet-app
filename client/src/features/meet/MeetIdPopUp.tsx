import React, {FC, useState} from 'react';
import {Button, Card, Space} from "antd";
import {CloseOutlined, CopyOutlined} from "@ant-design/icons";
// @ts-ignore
import {CopyToClipboard} from 'react-copy-to-clipboard';

export const MeetIdPopUp: FC<{ roomID: string }> = ({roomID}) => {
  const [open, setOpen] = useState(true)

  return (
    <div
      style={{
        position: "absolute",
        bottom: 50,
        left: 50,
        display: open ? 'block' : 'none'
      }}
    >
      <Space style={{position: 'relative'}} direction="vertical" size={16}>
        <Card style={{
          width: 300,
          backgroundColor: 'rgb(192,192,192)',
        }}>
          <div
          style={{
            position: "absolute",
            top: 5,
            right: 10
          }}
          >
            <CloseOutlined onClick={() => setOpen(false)}/>
          </div>
          <p>{roomID}
            <Button
              style={{
                margin: '0 10px'
              }}
              onClick={() => {navigator.clipboard.writeText(roomID)}}
            >

              <CopyOutlined/>
            </Button>
          </p>

        </Card>
      </Space>
    </div>
  );
};

