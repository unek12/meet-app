import React from 'react';
import './loading.css';
import { VideoCameraTwoTone } from '@ant-design/icons';
import { Spin } from 'antd'; // Подключаем стили

export const Loader = () => {
  return (
    <div className="loader-container">
      <Spin tip="Loading" size="large" />
    </div>
  );
};
