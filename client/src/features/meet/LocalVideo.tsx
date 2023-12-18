import React, {FC, RefObject, useEffect, useRef, useState} from 'react';
import {LOCAL_VIDEO, localMediaStreamsType} from "../../hooks/useWebRTC";
import {AudioMutedOutlined, AudioOutlined} from "@ant-design/icons";

export const LocalVideo: FC<{
  clientID: string,
  videoLayout: any,
  localMediaStreams: RefObject<localMediaStreamsType>,
  video: boolean,
  mic: boolean,
  setVideo: any,
  setMic: any
}> = ({clientID, videoLayout, localMediaStreams, video, mic}) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  // const [video, setVideo] = useState(localMediaStreams.current![clientID].video)
  // const [mic, setMic] = useState(localMediaStreams.current![clientID].microphone)
  const [imgUrl, setImgUrl] = useState('')
  const [username, setUsername] = useState('')

  useEffect(() => {
    if (localMediaStreams.current && videoRef.current && localMediaStreams.current[clientID]) {
      console.log(localMediaStreams.current[clientID].video)
      // setVideo(localMediaStreams.current[clientID].video)
      // setMic(localMediaStreams.current[clientID].microphone)
      setImgUrl(localMediaStreams.current[clientID].avatar)
      setUsername(localMediaStreams.current[clientID].username)
      videoRef.current.srcObject = localMediaStreams.current[clientID].connection;
    }
  }, [videoRef.current]);

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
        you
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
          display: video ? 'block' : 'none'
        }}
        ref={videoRef}
        autoPlay
        playsInline
        muted={clientID === LOCAL_VIDEO}/>
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
