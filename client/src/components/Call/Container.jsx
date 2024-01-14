import React, { useEffect, useState } from "react";
import { useStateProvider } from "@/context/StateContext";
import Image from "next/image";
import { MdCallEnd, MdOutlineCallEnd } from "react-icons/md";
import { reducerCases } from "@/context/constants";
import axios from "axios";
import { GET_CALL_TOKEN } from "@/utils/ApiRoutes";
import { ZegoExpressEngine } from "zego-express-engine-webrtc";

function Container({ data }) {
  console.log(data);
  const [{ socket, userInfo }, dispatch] = useStateProvider();
  const [callAccepted, setCallAccepted] = useState(false);
  const [token, setToken] = useState(undefined);
  const [zgVar, setZgVar] = useState(undefined);
  const [localStream, setLocalStream] = useState(undefined);
  const [publishStream, setPublishStream] = useState(undefined);

  useEffect(() => {
    if (data.type === "outgoing") {
      socket.current.on("accept-call", () => {
        setCallAccepted(true);
      });
    } else {
      setTimeout(() => {
        setCallAccepted(true);
      }, 1000);
    }
  }, [data]);

  useEffect(() => {
    const getToken = async () => {
      try {
        const { data } = await axios.get(`${GET_CALL_TOKEN}/${userInfo.id}`);
        setToken(data.token);
      } catch (error) {
        console.log(error);
      }
    };

    if (callAccepted) {
      getToken().then((r) => {});
    }
  }, [callAccepted]);

  useEffect(() => {
    const startCall = async () => {
      import("zego-express-engine-webrtc").then(async (zg) => {
        const engine = new zg.ZegoExpressEngine(
          process.env.NEXT_PUBLIC_ZEGO_APP_ID,
          process.env.NEXT_PUBLIC_ZEGO_SERVER_ID,
        );

        setZgVar(engine);

        engine.on(
          "roomStreamUpdate",
          async (roomID, updateType, streamList, extendedData) => {
            if (updateType === "ADD") {
              const remoteVideo = document.getElementById("remote-video");
              const vd = document.createElement(
                data.callType === "video" ? "video" : "audio",
              );
              vd.id = streamList[0].streamID;
              vd.autoplay = true;
              vd.playsInline = true;
              vd.muted = false;
              if (remoteVideo) {
                remoteVideo.appendChild(vd);
              }

              engine
                .startPlayingStream(streamList[0].streamID, {
                  audio: true,
                  video: true,
                })
                .then((stream) => (vd.srcObject = stream));
            } else if (
              updateType === "DELETE" &&
              engine &&
              localStream &&
              streamList[0].streamID
            ) {
              engine.destroyStream(localStream);
              engine.stopPublishingStream(streamList[0].streamID);
              engine.logoutRoom(data.roomId.toString());

              dispatch({
                type: reducerCases.END_CALL,
              });
            }
          },
        );

        await engine.loginRoom(
          data.roomId.toString(),
          token,
          {
            userID: userInfo.id.toString(),
            userName: userInfo.name,
          },
          {
            userUpdate: true,
          },
        );

        const localStream = await engine.createStream({
          camera: {
            audio: true,
            video: data.callType === "video",
          },
        });

        const localVideo = document.getElementById("local-video");
        const vd = document.createElement(
          data.callType === "video" ? "video" : "audio",
        );

        vd.id = "video-local-zego";
        vd.className = "h-28 w-32";
        vd.autoplay = true;
        vd.muted = false;
        vd.playsInline = true;

        if (localVideo) {
          localVideo.appendChild(vd);
        }

        const td = document.getElementById("video-local-zego");
        td.srcObject = localStream;

        const streamID = "123" + new Date().getTime();
        setPublishStream(streamID);
        setLocalStream(localStream);

        engine.startPublishingStream(streamID, localStream);
      });
    };

    if (callAccepted && token) {
      startCall().then((r) => {});
    }
  }, [token]);

  const handleEndCall = () => {
    if (zgVar && localStream && publishStream) {
      zgVar.destroyStream(localStream);
      zgVar.stopPublishingStream(publishStream);
      zgVar.logoutRoom(data.roomId.toString());
    }
    if (data.callType === "video") {
      socket.current.emit("reject-video-call", {
        from: data.id,
      });
    } else {
      socket.current.emit("reject-voice-call", {
        from: data.id,
      });
    }

    dispatch({
      type: reducerCases.END_CALL,
    });
  };

  return (
    <div
      className={
        "border-conversation-border border-l w-full bg-conversation-panel-background flex flex-col h-[100vh] overflow-hidden items-center justify-center text-white"
      }
    >
      <div className={"flex flex-col gap-3 items-center"}>
        <span className={"text-5xl"}>{data.name}</span>
        <span className={"text-lg"}>
          {callAccepted && data.callType !== "video"
            ? "On going call"
            : "Calling..."}
        </span>
      </div>
      {(!callAccepted || data.callType === "voice") && (
        <div className={"my-24"}>
          <Image
            src={data.profilePicture}
            alt={data.name}
            height={300}
            width={300}
            className={"rounded-full"}
          />
        </div>
      )}
      <div className={"my-5 relative"} id={"remote-video"}>
        <div className={"absolute bottom-5 right-5"} id={"local-video"}></div>
      </div>
      <div
        className={
          "h-16 w-16 bg-red-600 flex items-center justify-center rounded-full"
        }
      >
        <MdOutlineCallEnd
          className={"text-3xl cursor-pointer"}
          onClick={handleEndCall}
        />
      </div>
    </div>
  );
}

export default Container;
