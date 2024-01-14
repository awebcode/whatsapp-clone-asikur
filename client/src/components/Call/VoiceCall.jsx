import React, { useEffect } from "react";
import dynamic from "next/dynamic";
import { useStateProvider } from "@/context/StateContext";

const Container = dynamic(() => import("@/components/Call/Container"), {
  ssr: false,
});

function VoiceCall() {
  const [{ voiceCall, socket, userInfo }] = useStateProvider();

  useEffect(() => {
    if (voiceCall.type === "outgoing") {
      socket.current.emit("outgoing-voice-call", {
        to: voiceCall.id,
        from: {
          id: userInfo.id,
          name: userInfo.name,
          profilePicture: userInfo.profileImage,
        },
        callType: voiceCall.callType,
        roomId: voiceCall.roomId,
      });
    }
  }, []);

  return <Container data={voiceCall} />;
}

export default VoiceCall;
