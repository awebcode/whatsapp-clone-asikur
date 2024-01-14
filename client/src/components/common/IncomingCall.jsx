import React from "react";
import { useStateProvider } from "@/context/StateContext";
import { reducerCases } from "@/context/constants";
import Image from "next/image";

function IncomingCall() {
  const [{ incomingVoiceCall, socket }, dispatch] = useStateProvider();

  const acceptVoiceCall = () => {
    dispatch({
      type: reducerCases.SET_VOICE_CALL,
      voiceCall: {
        type: "in-coming",
        ...incomingVoiceCall,
      },
    });
    socket.current.emit("accept-incoming-call", {
      id: incomingVoiceCall.id,
    });

    dispatch({
      type: reducerCases.SET_INCOMING_VOICE_CALL,
      incomingVoiceCall: undefined,
    });
  };

  const rejectVoiceCall = () => {
    socket.current.emit("reject-voice-call", {
      from: incomingVoiceCall.id,
    });
    dispatch({
      type: reducerCases.END_CALL,
    });
  };

  return (
    <div
      className={
        "h-24 w-80 fixed bottom-8 mb-0 right-6 z-50 rounded-sm flex gap-5 items-center justify-start p-4 bg-conversation-panel-background text-white drop-shadow-2xl border-icon-green border-2 py-14"
      }
    >
      <div>
        <Image
          src={incomingVoiceCall.profilePicture}
          alt={"avatar"}
          height={70}
          width={70}
          className={"rounded-full"}
        />
      </div>

      <div>
        <div>{incomingVoiceCall.name}</div>
        <div className={"text-sm"}>Incoming Voice Call</div>
        <div className={"flex gap-2 mt-2"}>
          <button
            className={"bg-red-500 p-1 px-3 text-sm rounded-full"}
            onClick={rejectVoiceCall}
          >
            Reject
          </button>
          <button
            className={"bg-green-500 p-1 px-3 text-sm rounded-full"}
            onClick={acceptVoiceCall}
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}

export default IncomingCall;
