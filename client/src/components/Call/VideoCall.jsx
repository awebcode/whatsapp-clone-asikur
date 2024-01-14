import React, { useEffect } from "react";
import dynamic from "next/dynamic";
import { useStateProvider } from "@/context/StateContext";

const Container = dynamic(() => import("@/components/Call/Container"), {
  ssr: false,
});

function VideoCall() {
  const [{ videoCall, socket, userInfo }] = useStateProvider();
  useEffect(() => {
    if (videoCall.type === "outgoing") {
      socket.current.emit("outgoing-video-call", {
        to: videoCall.id,
        from: {
          id: userInfo.id,
          name: userInfo.name,
          profilePicture: userInfo.profileImage,
        },
        callType: videoCall.callType,
        roomId: videoCall.roomId,
      });
    }
  }, []);
  return <Container data={videoCall} />;
}

export default VideoCall;
