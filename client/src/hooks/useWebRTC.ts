import {useEffect, useRef, useCallback, RefObject, useState} from 'react';
// @ts-ignore
import freeice from 'freeice';
import socket from '../socket';
import {ACTIONS} from '../socket/actions';
import {useNavigate} from "react-router-dom";
import {useAuth} from "./useAuth";

export type peerConnectionsType = {
  [key: string]: {
    connection: RTCPeerConnection,
    video: boolean,
    microphone: boolean,
    isScreenShare: boolean,
    username: string,
    avatar: string
  }
}

export type localMediaStreamsType = {
  [key: string]: {
    connection: MediaStream,
    video: boolean,
    microphone: boolean,
    isScreenShare: boolean,
    username: string,
    avatar: string
  }
}

type peerMediaElementsType = {
  [key: string]: HTMLVideoElement | null
}

export const LOCAL_VIDEO = 'LOCAL_VIDEO';
export const LOCAL_SHARING = 'LOCAL_SHARING';

const processPeerID = ({peerID, isScreenShare}: { peerID: string, isScreenShare: boolean }) => {
  if (isScreenShare) return `${peerID}-screen-share`
  return peerID
}

const unProcessPeerID = ({peerID, isScreenShare}: { peerID: string, isScreenShare: boolean }) => {
  if (isScreenShare) return peerID.slice(0, -13)
  return peerID
}

export default function useWebRTC(roomID: string, initVideo: boolean, initMic: boolean) {
  const [clients, updateClients] = useState<string[]>([]);
  const user = useAuth()!

  const addNewClient = useCallback((newClient: string) => {
    updateClients((list) => [...list, newClient]);
  }, [clients]);

  const peerConnections = useRef<peerConnectionsType>({});
  const localMediaStreams = useRef<localMediaStreamsType>({});

  const toggleOptions = (options: { isVideoOn: boolean, isMicrophoneOn: boolean }) => {
    console.log(options)
    const audioTracks = localMediaStreams.current[LOCAL_VIDEO].connection.getAudioTracks();
    const videoTracks = localMediaStreams.current[LOCAL_VIDEO].connection.getVideoTracks();
    if (audioTracks) {
      audioTracks.forEach((track) => {
        track.enabled = options.isMicrophoneOn;
      });
      localMediaStreams.current[LOCAL_VIDEO].microphone = options.isMicrophoneOn
    }
    if (videoTracks) {
      videoTracks.forEach((track) => {
        track.enabled = options.isVideoOn;
        localMediaStreams.current[LOCAL_VIDEO].video = options.isVideoOn
      });
    }
    socket.emit(ACTIONS.TOGGLE_OPTIONS, {roomID, ...options});
  }


  useEffect(() => {
    async function handleNewPeer({
                                   peerID,
                                   createOffer,
                                   isVideoOn,
                                   isMicrophoneOn,
                                   isScreenShare = false,
                                   username,
                                   avatar
                                 }: {
      peerID: string
      createOffer: boolean
      isScreenShare: boolean
      isVideoOn: boolean
      isMicrophoneOn: boolean
      username: string
      avatar: string
    }) {
      peerID = processPeerID({peerID, isScreenShare})
      if (peerID in peerConnections.current) {
        return console.warn(`Already connected to peer ${peerID}`);
      }

      peerConnections.current[peerID] = {
        connection: new RTCPeerConnection({
          iceServers: freeice(),
        }),
        video: isVideoOn,
        microphone: isMicrophoneOn,
        isScreenShare,
        username,
        avatar
      }
      console.log(peerConnections.current[peerID])

      peerConnections.current[peerID].connection.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit(ACTIONS.RELAY_ICE, {
            // peerID,
            peerID: unProcessPeerID({peerID, isScreenShare}),
            iceCandidate: event.candidate,
            isScreenShare
          });
        }
      }
      if (isScreenShare && !localMediaStreams.current[LOCAL_SHARING]) {
        addNewClient(peerID)
      } else if (!isScreenShare) {
        addNewClient(peerID)
      }

      if (isScreenShare && localMediaStreams.current[LOCAL_SHARING]) {
        localMediaStreams.current[LOCAL_SHARING].connection?.getTracks().forEach((track) => {
          peerConnections.current[peerID].connection.addTrack(track, localMediaStreams.current[LOCAL_SHARING].connection!);
        });
      } else if (!isScreenShare) {
        localMediaStreams.current[LOCAL_VIDEO].connection.getTracks().forEach((track) => {
          peerConnections.current[peerID].connection.addTrack(track, localMediaStreams.current[LOCAL_VIDEO].connection);
        });
      }

      if (createOffer) {
        const offer = await peerConnections.current[peerID].connection.createOffer();

        await peerConnections.current[peerID].connection.setLocalDescription(offer);

        socket.emit(ACTIONS.RELAY_SDP, {
          peerID: unProcessPeerID({peerID, isScreenShare}),
          // peerID,
          sessionDescription: offer,
          isScreenShare
        });
      }

      if (localMediaStreams.current[LOCAL_SHARING]) {
        socket.emit(ACTIONS.JOIN, {room: roomID, isScreenShare: true, isMicrophoneOn: true, isVideoOn: true})
      }
      console.log(peerConnections.current)
    }

    socket.on(ACTIONS.ADD_PEER, handleNewPeer);

    return () => {
      console.log('off')
      socket.off(ACTIONS.ADD_PEER);
    }
  }, []);

  useEffect(() => {
    async function setRemoteMedia({peerID, sessionDescription: remoteDescription, isScreenShare = false}: {
      peerID: string,
      sessionDescription: RTCSessionDescriptionInit,
      isScreenShare: boolean,
    }) {
      peerID = processPeerID({peerID, isScreenShare})
      await peerConnections.current[peerID]?.connection.setRemoteDescription(
        new RTCSessionDescription(remoteDescription)
      );

      if (remoteDescription.type === 'offer') {
        const answer = await peerConnections.current[peerID].connection.createAnswer();

        await peerConnections.current[peerID].connection.setLocalDescription(answer);

        socket.emit(ACTIONS.RELAY_SDP, {
          peerID: unProcessPeerID({peerID, isScreenShare}),
          sessionDescription: answer,
          isScreenShare
        });
      }
    }

    socket.on(ACTIONS.SESSION_DESCRIPTION, setRemoteMedia)

    return () => {
      socket.off(ACTIONS.SESSION_DESCRIPTION);
    }
  }, []);

  useEffect(() => {
    socket.on(ACTIONS.ICE_CANDIDATE, ({peerID, iceCandidate, isScreenShare}) => {
      peerID = processPeerID({peerID, isScreenShare})
      peerConnections.current[peerID]?.connection.addIceCandidate(
        new RTCIceCandidate(iceCandidate)
      );
    });

    return () => {
      socket.off(ACTIONS.ICE_CANDIDATE);
    }
  }, []);

  useEffect(() => {
    const handleRemovePeer = ({peerID, isScreenShare}: { peerID: string, isScreenShare: boolean }) => {
      if (!isScreenShare && peerConnections.current[peerID]) {
        peerConnections.current[peerID]?.connection.close();
        delete peerConnections.current[peerID];
        updateClients((list: string[]) => list.filter(c => c !== peerID));
      }

      if (isScreenShare && peerConnections.current[`${peerID}-screen-share`]) {
        peerConnections.current[`${peerID}-screen-share`]?.connection.close();
        delete peerConnections.current[`${peerID}-screen-share`];
        updateClients((list: string[]) => list.filter(c => c !== `${peerID}-screen-share`));
      }

      if (isScreenShare && localMediaStreams.current[LOCAL_SHARING]) {
        delete localMediaStreams.current[LOCAL_SHARING]
      }

      if (clients.filter((clientId: string) => clientId.length > 20 && clientId.slice(0, 20) === peerID)) {
        peerConnections.current[`${peerID}-screen-share`]?.connection.close();
        delete peerConnections.current[`${peerID}-screen-share`];
        updateClients((list: string[]) => list.filter(c => c !== `${peerID}-screen-share`));
      }
    };

    socket.on(ACTIONS.REMOVE_PEER, handleRemovePeer);

    return () => {
      socket.off(ACTIONS.REMOVE_PEER);
    }
  }, []);

  useEffect(() => {
    async function startCapture() {
      const localMedia = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: {
          width: 1280,
          height: 720
        }
      });
      localMediaStreams.current[LOCAL_VIDEO] = {
        connection: localMedia,
        video: initVideo,
        microphone: initMic,
        isScreenShare: false,
        username: user.username,
        avatar: user.avatar
      }

      addNewClient(LOCAL_VIDEO);
    }

    startCapture()
      .then(() => socket.emit(ACTIONS.JOIN, {
        room: roomID,
        isVideoOn: localMediaStreams.current[LOCAL_VIDEO].video,
        isMicrophoneOn: localMediaStreams.current[LOCAL_VIDEO].microphone
      }))
      .catch(e => console.error('Error getting userMedia:', e));

    return () => {
      localMediaStreams.current[LOCAL_VIDEO]?.connection.getTracks().forEach(track => track.stop());
      localMediaStreams.current[LOCAL_SHARING]?.connection.getTracks().forEach(track => track.stop());

      socket.emit(ACTIONS.LEAVE);
      socket.emit(ACTIONS.LEAVE, {room: roomID, isScreenShare: true});
    };
  }, [roomID]);

  const startScreenSharing = async () => {
    navigator.mediaDevices.getDisplayMedia({
      audio: true,

    })
      .then((streams) => {
        localMediaStreams.current[LOCAL_SHARING] = {
          connection: streams,
          video: true,
          microphone: true,
          isScreenShare: true,
          username: user.username,
          avatar: user.avatar
        }

        localMediaStreams.current[LOCAL_SHARING].connection.getTracks().forEach((stream) => {
          if (stream) {
            stream.onended = () => {
              socket.emit(ACTIONS.LEAVE, {
                room: roomID,
                isScreenShare: true,
                isMicrophoneOn: true,
                isVideoOn: true
              })
              updateClients((list: string[]) => list.filter(c => c !== LOCAL_SHARING));
            }
          }
        })

        addNewClient(LOCAL_SHARING);
        socket.emit(ACTIONS.JOIN, {
          room: roomID,
          isScreenShare: localMediaStreams.current[LOCAL_SHARING].isScreenShare,
          isMicrophoneOn: localMediaStreams.current[LOCAL_SHARING].microphone,
          isVideoOn: localMediaStreams.current[LOCAL_SHARING].video
        })
      })
      .catch(() => {
      });
  }

  return {
    clients,
    toggleOptions,
    startScreenSharing,
    peerConnections,
    localMediaStreams
  };
}
