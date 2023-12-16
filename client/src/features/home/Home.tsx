import React, {useEffect, useState} from 'react';
import {Link, useNavigate} from "react-router-dom";
import {useCreateMeetingMutation, useGetMeetingQuery} from "../../services/meet";
import {Profile} from "../profile/Profile";
import Search from 'antd/es/input/Search';
import {Button, Input} from "antd";
import MeetHistory from "./MeetHistory";
import {useAuth} from "../../hooks/useAuth";

export const Home = () => {
  const [createMeeting, {isLoading}] = useCreateMeetingMutation()
  const user = useAuth()!
  const [roomID, setRoomID] = useState('')
  const [meetName, setMeetName] = useState('')
  const [createMeetingLoading, setCreateMeetingLoading] = useState(false)
  const nav = useNavigate()

  return (
    <div style={{
      // position: "relative",
      // display: 'flex'
    }}>
      <div style={{
        maxWidth: 800,
        margin: '10px auto',
      }}>
        <div style={{
        }}>
          <div style={{
            display: 'flex',
            width: '100%'
          }}>
            <Input
              style={{
                margin: '0 40px'
              }}
              placeholder={'meeting title'}
              value={meetName}
              onChange={(e) => {
                setMeetName(e.target.value)
              }}
            />
            <Button type='primary' disabled={isLoading} onClick={async () => {
              const a = await createMeeting({title: meetName || `${user.name} meeting`}).unwrap()
              nav(`/meet/${a['id']}`)
            }}>create meeting</Button>
          </div>
          <div style={{
            display: 'flex',
            width: '100%',
            margin: '10px 0'
          }}>
            <Input
              style={{
                margin: '0 55px 0 40px'
              }}
              placeholder={'joining meet id'}
              value={roomID}
              onChange={(e) => {
                setRoomID(e.target.value)
              }}
            />
            <Button
              type='primary'
              disabled={roomID.length !== 24}
              onClick={() => {
                nav(`/meet/${roomID}`)
              }}
            >join meeting</Button>
          </div>
        </div>

        <Profile/>
        <MeetHistory/>
      </div>
    </div>
  );
};
