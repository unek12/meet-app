import {useParams} from 'react-router';
import useWebRTC, {LOCAL_SHARING, LOCAL_VIDEO} from '../../hooks/useWebRTC';
import {useNavigate} from "react-router-dom";
import {FC, useEffect, useRef, useState} from "react";
import Chat from "./Chat";
import {Video} from "./Video";
import {LocalVideo} from "./LocalVideo";
import {LocalSharing} from "./LocalSharing";
import {Button} from "antd";
import {MeetIdPopUp} from "./MeetIdPopUp";
import { useGetMeetingQuery } from '../../services/meet';

function calculateDimensions(userCount: number, totalWidth: number, totalHeight: number) {
  const aspectRatio = 16 / 9; // Формат 16:9
  let rows = Math.ceil(userCount / 3); // Количество строк, максимум 3 колонки в строке
  let columns = Math.min(userCount, 3); // Количество столбцов, максимум 3 колонки
  if (userCount === 2) {
    rows = 1;
    columns = 2;
  }

  let availableHeight = Math.floor(totalWidth / aspectRatio / columns) * rows;
  let availableWidth = Math.floor(totalHeight * aspectRatio / rows) * columns;

  if (availableHeight > totalHeight) {
    availableHeight = totalHeight;
    availableWidth = Math.floor(totalHeight * aspectRatio);
  } else if (availableWidth > totalWidth) {
    availableWidth = totalWidth;
    availableHeight = Math.floor(totalWidth / aspectRatio);
  }

  // Рассчитываем ширину и высоту для каждого пользователя
  const width = Math.floor(availableWidth / columns) - 30;
  const height = Math.floor(availableHeight / rows);

  // Создаем массив из ширины и высоты для каждого пользователя
  return Array(userCount).fill(0).map(() => ({width, height: width / 16 * 9}));
}

const Meet: FC<{
  initVideo: boolean,
  initMic: boolean
}> = ({initVideo, initMic}) => {
  const {id: roomID} = useParams();
  const nav = useNavigate()
  const {data, isLoading} = useGetMeetingQuery(roomID)

  if (!roomID) {
    nav('/')
  }
  const [chat, setChat] = useState(false)

  const elementRef = useRef<HTMLDivElement>(null);
  const {
    clients,
    toggleOptions,
    startScreenSharing,
    peerConnections,
    localMediaStreams,
    name
  } = useWebRTC(roomID!, initVideo, initMic);

  const [video, setVideo] = useState(initVideo)
  const [mic, setMic] = useState(initMic)

  const [videoLayout, setVideoLayout]
    = useState<{ width: number, height: number }[]>([]);

  useEffect(() => {
    if (elementRef.current) {
      const element = elementRef.current;
      const {width, height} = element.getBoundingClientRect();
      setVideoLayout(calculateDimensions(clients.length, width, height))
    }
  }, [clients, chat]);

  useEffect(() => {
    if (localMediaStreams.current && localMediaStreams.current[LOCAL_VIDEO]) {
      setVideo(localMediaStreams.current![LOCAL_VIDEO].video)
      setMic(localMediaStreams.current![LOCAL_VIDEO].microphone)

      console.log(localMediaStreams.current![LOCAL_VIDEO].video)
    }
  }, [localMediaStreams.current]);


  return (
    <div style={{
      display: "flex",
      overflow: "hidden",
      position: "relative",
    }}>
      <div
        style={{
          display: "flex",
          flexDirection: 'column'
        }}
      >
        <div style={{
          fontWeight: 500,
          fontSize: 42,
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'"
        }}>
          {
            data.title
          }
        </div>
        <div style={{
          width: chat ? '70vw' : '100vw',
          height: 'calc(100vh - 100px)',
          display: "flex",
          flexDirection: 'column'
        }}>

          <div style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-evenly',
            flexWrap: 'wrap',
            maxHeight: 'calc(100vh - 50px)',
            height: '100%'
          }}
               ref={elementRef}
          >
            {
              clients.map((clientID, index) => {
                if (clientID === LOCAL_VIDEO) {
                  return <LocalVideo
                    key={clientID}
                    clientID={clientID}
                    videoLayout={videoLayout[index]}
                    localMediaStreams={localMediaStreams}
                    video={video}
                    mic={mic}
                    setMic={setMic}
                    setVideo={setVideo}
                  />
                }

                if (clientID === LOCAL_SHARING) {
                  return <LocalSharing
                    key={clientID}
                    clientID={clientID}
                    videoLayout={videoLayout[index]}
                    localMediaStreams={localMediaStreams}
                  />
                }

                return (<Video
                  key={clientID}
                  videoLayout={videoLayout[index]}
                  clientID={clientID}
                  peerConnections={peerConnections}
                />);
              })
            }
          </div>
        </div>

        <div style={{
          display: "flex",
          justifyContent: 'space-between'
        }}>
          <div style={{
            display: 'flex',
            margin: 'auto'
          }}>
            <Button
              style={{
                margin: '0 5px'
              }}
              type={mic ? 'primary' : 'default'}
              onClick={() => {
                toggleOptions({
                  isVideoOn: video,
                  isMicrophoneOn: !mic,
                })
                setMic(!mic)
              }}
            >
              микрофон
            </Button>
            <Button
              style={{
                margin: '0 5px'
              }}
              type={video ? 'primary' : 'default'}
              onClick={() => {
                toggleOptions({
                  isVideoOn: !video,
                  isMicrophoneOn: mic,
                })
                setVideo(!video)
              }}
            >
              видео
            </Button>
            <Button
              style={{
                margin: '0 5px'
              }}
              type={'primary'}
              onClick={() => startScreenSharing()}
              disabled={!!clients.find(clientID => clientID === LOCAL_SHARING) || !!clients.find(clientID => clientID.includes('screen-share'))}
            >
              поделится экраном
            </Button>

            <Button
              style={{
                margin: '0 5px'
              }}
              type={'primary'}
              onClick={() => setChat(!chat)}
            >
              чат
            </Button>
          </div>
          <div>
            <Button
              type={'primary'}
              onClick={() => nav('/')}
            >
              выйти
            </Button>
          </div>
        </div>
      </div>


      <div style={{
        width: chat ? '30vw' : '0',
        display: 'block'
      }}>
        <Chat roomID={roomID!}/>
      </div>
      <MeetIdPopUp roomID={roomID!}/>
    </div>
  );
}

export default Meet
