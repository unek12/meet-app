import React, {useEffect, useState} from 'react';
import {Line, LineConfig} from '@ant-design/charts';
import {useGetMeetingsStatsQuery} from "../../services/meet";
import {Alert, Radio, Space, Spin} from "antd";

type PaginationPosition = 'month' | 'week' | 'day';
const positionOptions = [
  {
    value: 'month',
    name: 'месяц'
  },
  {
    value: 'week',
    name: 'неделя'
  },
  {
    value: 'day',
    name: 'день'
  },
];
export const MeetChart = () => {
  const [position, setPosition] = useState<PaginationPosition>('week');
  const {data, isLoading, isFetching} = useGetMeetingsStatsQuery({
    interval: position
  })

  useEffect(() => {
    console.log(data)
  }, [data]);

  const config = {
    xField: 'date',
    yField: 'count',
    point: {
      size: 5,
      shape: 'diamond',
    },
  };

  return (
    <div style={{
      margin: '50px 10px'
    }}>
      <Space direction="vertical" style={{ marginBottom: '20px' }} size="middle">
        <Space>
          <span>Pagination Position:</span>
          <Radio.Group
            optionType="button"
            value={position}
            onChange={(e) => {
              setPosition(e.target.value);
            }}
          >
            {positionOptions.map((item) => (
              <Radio.Button key={item.value} value={item.value}>
                {item.name}
              </Radio.Button>
            ))}
          </Radio.Group>
        </Space>
      </Space>
      {
        !(isLoading || isFetching) &&
        <>
          <Line data={Object.entries(data || {}).map(([date, count]) => ({ date, count }))} { ...config }/>
        </>
      }

      {
        (isLoading || isFetching) &&

        <Spin tip="Loading..."/>
      }
    </div>
  );
};
