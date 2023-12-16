import React, {useEffect, useState} from 'react';
import {Button, List, Pagination} from 'antd';
import {useGetMeetingsForUserQuery} from "../../services/meet";
import {useAuth} from "../../hooks/useAuth";

const data = [
  'Racing car sprays burning fuel into crowd.',
  'Japanese princess to wed commoner.',
  'Australian walks 100km after outback crash.',
  'Man charged over missing wedding girl.',
  'Los Angeles battles huge wildfires.',
  'Racing car sprays burning fuel into crowd.',
  'Japanese princess to wed commoner.',
  'Australian walks 100km after outback crash.',
  'Man charged over missing wedding girl.',
];
const MeetHistory: React.FC = () => {
  const [initLoading, setInitLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const user = useAuth()!
  const {data, isLoading} = useGetMeetingsForUserQuery({
    userId: user.id,
    page: current,
    take: 10
  })
  useEffect(() => {
    console.log(data)
  }, [data]);

  return (
    <>
      {/*{*/}
      {/*  isLoading &&*/}

      {/*}*/}
      <List
        style={{
          margin: '40px 0'
        }}
        header={<span style={{
          fontSize: 24,
          fontWeight: 600
        }}>Previous meetings</span>}
        footer=
          {
            !isLoading &&
            <Pagination
              showSizeChanger={false}
              current={current + 1}
              total={(data?.pages + 1) * 10}
              onChange={(page) => {
                console.log(page);
                setCurrent(page - 1);
              }}
            />
          }
        bordered
        dataSource={data?.data || []}
        loading={isLoading}
        renderItem={(item: {title: string, date: string}) => (
          <List.Item>
            <div style={{
              display: 'flex',
              justifyContent: "space-between",
              width: '100%'
            }}>
              <div>
                {
                  item.title
                }
                -
                {
                  item.date
                }
              </div>
              <Button>details</Button>
            </div>
          </List.Item>
        )}
      />
    </>

  );
};

export default MeetHistory;
