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
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const searchInput = useRef<InputRef>(null);
  const [current, setCurrent] = useState(0);
  const {data, isLoading, isFetching} = useGetMeetingsQuery({
    page: current,
    take: 10
  })

  const handleSearch = (
    selectedKeys: string[],
    confirm: (param?: FilterConfirmProps) => void,
    dataIndex: DataIndex,
  ) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters: () => void) => {
    clearFilters();
    setSearchText('');
  };

  const getColumnSearchProps = (dataIndex: DataIndex): ColumnType<DataType> => ({
    filterDropdown: ({setSelectedKeys, selectedKeys, confirm, clearFilters, close}) => (
      <div style={{padding: 8}} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0] as string}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys as string[], confirm, dataIndex)}
          style={{marginBottom: 8, display: 'block'}}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys as string[], confirm, dataIndex)}
            icon={<SearchOutlined/>}
            size="small"
            style={{width: 90}}
          >
            Search
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{width: 90}}
          >
            Reset
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              confirm({closeDropdown: false});
              setSearchText((selectedKeys as string[])[0]);
              setSearchedColumn(dataIndex);
            }}
          >
            Filter
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              close();
            }}
          >
            close
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered: boolean) => (
      <SearchOutlined style={{color: filtered ? '#1677ff' : undefined}}/>
    ),
    onFilter: (value, record) =>
      record[dataIndex]
        .toString()
        .toLowerCase()
        .includes((value as string).toLowerCase()),
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
  });

  const columns: ColumnsType<DataType> = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'id',
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'id',
    },
    {
      title: 'Organizer',
      dataIndex: ['organizer', 'username'],
      key: 'id',
    },
  ];

  return (<>
    <MeetChart/>
    <Table
      loading={isLoading || isFetching}
      columns={columns}
      dataSource={data?.data}
      pagination={false}
    />
    {
      !isLoading && <Pagination
        showSizeChanger={false}
        current={current + 1}
        total={(data?.pages + 1) * 10}
        onChange={(page) => {
          setCurrent(page - 1);
        }}
      />
    }
  </>)
};
