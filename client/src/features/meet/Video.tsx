import React, {FC, RefObject, useEffect, useRef, useState} from 'react';
import {LOCAL_VIDEO, peerConnectionsType} from "../../hooks/useWebRTC";
import socket from "../../socket";
import {ACTIONS} from "../../socket/actions";
import {AudioMutedOutlined, AudioOutlined} from "@ant-design/icons";

export const Video: FC<{
  clientID: string,
  videoLayout: any,
  peerConnections: RefObject<peerConnectionsType>
}> = ({clientID, videoLayout, peerConnections}) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [video, setVideo] = useState(false)
  const [mic, setMic] = useState(true)
  const [imgUrl, setImgUrl ] = useState('')
  const [username, setUsername] = useState('')

  useEffect(() => {
    if (peerConnections.current && peerConnections.current[clientID]) {

      setImgUrl(peerConnections.current[clientID].avatar)
      setUsername(peerConnections.current[clientID].username)

      peerConnections.current[clientID].connection.ontrack = ({streams: [remoteStream]}) => {
        if (remoteStream.getTracks().length === 2 || peerConnections.current![clientID].isScreenShare) {
          if (videoRef.current) {
            videoRef.current.srcObject = remoteStream;
          } else {
            // FIX LONG RENDER IN CASE OF MANY CLIENTS
            let settled = false;
            const interval = setInterval(() => {
              if (videoRef.current) {
                videoRef.current.srcObject = remoteStream;
                settled = true;
              }
              if (settled) {
                clearInterval(interval);
              }
            }, 1000);
          }
        }
      }

      setVideo(peerConnections.current[clientID].isScreenShare ? true : peerConnections.current[clientID].video)
      setMic(peerConnections.current[clientID].microphone)
    }
  }, []);

  useEffect(() => {
    socket.on(ACTIONS.TOGGLE_OPTIONS, ({peerID, isMicrophoneOn, isVideoOn}) => {
      if (peerConnections.current && peerConnections.current[peerID]) {
        if (peerID === clientID && !peerConnections.current[peerID].isScreenShare) {
          peerConnections.current[peerID].microphone = isMicrophoneOn;
          peerConnections.current[peerID].video = isVideoOn;
          setMic(isMicrophoneOn)
          setVideo(isVideoOn)
        }
      }
    })
    return () => {
      console.log(`off - ${clientID}`)
      socket.off(ACTIONS.TOGGLE_OPTIONS)
    }
  }, [])

  // useEffect(() => {
  //   if (peerConnections.current)
  //   console.log('video', peerConnections.current[clientID].video)
  // }, [peerConnections.current && peerConnections.current[clientID].video]);

  return (
    <div style={{
      ...videoLayout,
      borderRadius: 30,
      overflow: "hidden",
      position: 'relative'
      // margin: 10
    }} id={clientID}>
      <div style={{
        position: 'absolute',
        bottom: 20,
        left: 25,
        color: 'white',
        backgroundColor: 'rgba(0, 0, 0, .5)',
        padding: '4px 10px',
        borderRadius: '10px'
      }}>
        {username}
      </div>

      {
        mic ?
          <AudioOutlined
            style={{
              position: 'absolute',
              bottom: 20,
              right: 25,
              fontSize: 20,
            }}
          />
          :
          <AudioMutedOutlined
            style={{
              position: 'absolute',
              bottom: 20,
              right: 25,
              fontSize: 20,
            }}
          />
      }

      <div style={{
        display: video ? 'none' : 'block',
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        margin: 'auto',
        width: 102,
        height: 102,
        backgroundImage: `url(${imgUrl ? `${process.env.REACT_APP_API_URL}/static/images/${imgUrl}` : "https://s3-us-west-2.amazonaws.com/s.cdpn.io/20625/avatar-bg.png"})`,
        borderRadius: 51,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}>

      </div>
      <video
        width='100%'
        height='100%'
        style={{
          // ...videoLayout,
          display: video ? 'block' : 'none'
        }}
        ref={videoRef}
        autoPlay
        playsInline
        muted={!mic}
      />
      <div
        style={{
          ...videoLayout,
          display: video ? 'none' : 'block',
          backgroundColor: 'pink'
        }}
      >
      </div>
    </div>
  );
};
