import {SearchOutlined} from '@ant-design/icons';
import React, {useEffect, useRef, useState} from 'react';
import type {InputRef} from 'antd';
import {Button, Input, Pagination, Space, Table} from 'antd';
import type {ColumnType, ColumnsType} from 'antd/es/table';
import type {FilterConfirmProps} from 'antd/es/table/interface';
import {useGetMeetingsQuery} from "../../services/meet";
import {User} from "../auth/authSlice";
import {MeetChart} from "./MeetChart";

interface DataType {
  id: string;
  title: string;
  date: number;
  organizer: User;
}

type DataIndex = keyof DataType;

export const MeetTab: React.FC = () => {
  return (<>
    <MeetChart/>
  </>)
};
