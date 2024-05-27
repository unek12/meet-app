import React, {FC, RefObject, useEffect, useRef, useState} from 'react';
import { LOCAL_SHARING, LOCAL_VIDEO, localMediaStreamsType } from '../../hooks/useWebRTC';

export const LocalSharing: FC<{
  clientID: string,
  videoLayout: any,
  localMediaStreams: RefObject<localMediaStreamsType>,
}> = ({clientID, videoLayout, localMediaStreams}) => {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (localMediaStreams.current && localMediaStreams.current[clientID]) {
      videoRef.current!.srcObject = localMediaStreams.current[clientID].connection;
    }
  }, [videoRef.current]);

  // useEffect(() => {
  //   console.log(1)
  //   if (localMediaStreams.current && localMediaStreams.current[clientID]) {
  //     setMic(localMediaStreams.current[clientID].video)
  //     setMic(localMediaStreams.current[clientID].microphone)
  //   }
  // }, [localMediaStreams.current![clientID]]);

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
        borderRadius: '10px',
      }}>
        Ваш экран
      </div>
      <video
        width='100%'
        height='100%'
        style={{
          display: 'block'
        }}
        ref={videoRef}
        autoPlay
        playsInline
        muted={true}
      />
    </div>
  );
};
