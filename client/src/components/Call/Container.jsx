import React, { useEffect, useState } from "react";
import { useStateProvider } from "@/context/StateContext";
import Image from "next/image";
import { MdOutlineCallEnd } from "react-icons/md";
import { reducerCases } from "@/context/constants";
import { useRouter } from "next/router";

function Container({ data }) {
  const [{ socket, userInfo }, dispatch] = useStateProvider();
  const [callAccepted, setCallAccepted] = useState(false);

  const router = useRouter();
  useEffect(() => {
    if (data.type === "outgoing") {
      socket.current.on("accept-call", (data) => {
        setCallAccepted(true);
        console.log({ acceptcall: data });
        router.push(`/room/${data.id}`);
      });
    } else {
      setTimeout(() => {
        setCallAccepted(true);
      }, 1000);
    }
  }, [data]);

  const handleEndCall = () => {
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
