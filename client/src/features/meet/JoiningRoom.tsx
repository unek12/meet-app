import React, {FC, useEffect, useRef, useState} from 'react';
import {useGetMeetingQuery} from "../../services/meet";
import {useParams} from "react-router";
import {useNavigate} from "react-router-dom";
import {toast} from "react-toastify";
import Meet from "./Meet";
import {Button} from "antd";
import {useAuth} from "../../hooks/useAuth";

type Props = {
  children?: React.ReactNode
};

const JoiningRoom: FC<Props> = ({children}) => {
  const {id: roomID} = useParams();
  const nav = useNavigate()
  if (!roomID) {
    nav('/')
  }
  const [video, setVideo] = useState(true)
  const [mic, setMic] = useState(true)
  const user = useAuth()!
  const {data, isLoading} = useGetMeetingQuery(roomID)
  const [joined, setJoined] = useState(false)
  const [mediaError, setMediaError] = useState<boolean>(true)
  const videoRef = useRef<HTMLVideoElement>(null)
  useEffect(() => {
    let mediaStream: MediaStream | null = null;
    navigator.mediaDevices.getUserMedia({
      audio: true,
      video: {
        width: 1280,
        height: 720
      }
    }).then(res => {
      mediaStream = res;
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
      setMediaError(false)
    })
      .catch(() => {
        setMediaError(true)
        toast.error('Please provide audio and video permissions')
      })

    return () => {
      mediaStream?.getTracks().forEach((item) =>{
        item.stop()
      })

      if (videoRef.current) {
        videoRef.current.srcObject = null
      }
    }
  }, []);

  useEffect(() => {
    console.log(data)
  }, [data]);

  // useEffect(() => {
  //   if (videoRef.current && localMediaStream) {
  //     videoRef.current.srcObject = localMediaStream
  //   }
  // }, [localMediaStream]);

  if (joined) {
    return <Meet initMic={mic} initVideo={video}/>
  }

  return (
    <div style={{
      width: "fit-content",
      margin: "auto",
      position: 'relative'
    }}>
      <div style={{
        display: video ? 'none' : 'block',
        position: 'absolute',
        zIndex: 1000,
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        margin: 'auto',
        width: 102,
        height: 102,
        backgroundImage: `url(${user.avatar ? `${process.env.REACT_APP_API_URL}/static/images/${user.avatar}` : "https://s3-us-west-2.amazonaws.com/s.cdpn.io/20625/avatar-bg.png"})`,
        borderRadius: 51,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}>
      </div>
      <video
        style={{
          width: 500,
          display: video ? 'block' : 'none',
        }}
        autoPlay
        playsInline
        ref={videoRef}
        muted={!mic}
      />
      <div
        style={{
          width: 500,
          height: 280,
          display: video ? 'none' : 'block',
          backgroundColor: 'pink'
        }}
      >
      </div>
      <div style={{
        marginTop: 10
      }}>
        <Button
          type={mic ? 'primary' : 'default'}
          style={{
            margin: '0 5px'
          }}
          onClick={() => {
            setMic(!mic)
          }}
        >
          mic
        </Button>
        <Button
          type={video ? 'primary' : 'default'}
          style={{
            margin: '0 5px'
          }}
          onClick={() => {
            setVideo(!video)
          }}
        >
          video
        </Button>
        <Button
          type={'primary'}
          disabled={isLoading || mediaError || !data}
          onClick={() => setJoined(true)}
        >
          Join
        </Button>
      </div>
    </div>
  );
};

export default JoiningRoom;
