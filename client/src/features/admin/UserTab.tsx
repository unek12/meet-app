import React, {useEffect, useState} from 'react';
import {Pagination, Table} from 'antd';
import type {ColumnsType} from 'antd/es/table';
import {useGetUsersQuery} from "../../services/user";

interface DataType {
  username: string,
  name: string,
  avatar: string
}

export const UserTab: React.FC = () => {
  const [current, setCurrent] = useState(0);
  const {data, isLoading, isFetching} = useGetUsersQuery({
    page: current,
    take: 10
  })

  useEffect(() => {
    console.log(data)
  }, [data]);

  const columns: ColumnsType<DataType> = [
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
      width: '30%',
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: '20%',
    },
    {
      title: 'Avatar',
      dataIndex: 'avatar',
      key: 'avatar',
    },
  ];

  return <>
    <Table
      loading={isLoading || isFetching}
      columns={columns}
      dataSource={data?.data || []}
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
  </>
};
