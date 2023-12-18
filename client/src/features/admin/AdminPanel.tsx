import React, {useEffect, useState} from 'react';
import {AppstoreOutlined, MailOutlined, SettingOutlined} from '@ant-design/icons';
import type {MenuProps} from 'antd';
import {Menu} from 'antd';
import { UserTab } from './UserTab';
import {MeetTab} from "./MeetTab";
import {useNavigate} from "react-router-dom";
import {useAuth} from "../../hooks/useAuth";

const items: MenuProps['items'] = [
  {
    label: 'Main page',
    key: 'main',
    // icon: <MailOutlined/>,
  },
  {
    label: 'Meetings',
    key: 'meet',
    // icon: <MailOutlined/>,
  },
  {
    label: 'Users',
    key: 'user',
    // icon: <MailOutlined/>,
  },
];

const AdminPanel: React.FC = () => {
  const [current, setCurrent] = useState('meet');
  const user = useAuth()!
  const nav = useNavigate()

  const onClick: MenuProps['onClick'] = (e) => {
    console.log('click ', e);
    setCurrent(e.key);
  };

  useEffect(() => {
    if (current === 'main') {
      nav('/')
    }
  }, [current]);

  useEffect(() => {
    if (!user.isAdmin) nav('/')
  }, []);

  return (
    <>
      <Menu onClick={onClick} selectedKeys={[current]} mode="horizontal" items={items}/>
      {
        current === 'meet' &&
        <MeetTab/>
      }

      {
        current === 'user' &&
        <UserTab/>
      }
      {/*<UserTab/>*/}
    </>
  );
};

export default AdminPanel;
