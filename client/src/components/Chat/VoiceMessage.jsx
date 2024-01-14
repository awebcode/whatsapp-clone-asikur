import React, { useEffect } from "react";
import WaveSurfer from "wavesurfer.js";
import { useStateProvider } from "@/context/StateContext";
import { HOST } from "@/utils/ApiRoutes";
import { calculateTime, formatTime } from "@/utils/CalculateTime";
import Avatar from "@/components/common/Avatar";
import { FaPlay, FaStop } from "react-icons/fa";
import MessageStatus from "@/components/common/MessageStatus";

function VoiceMessage({ message }) {
  const [{ userInfo, currentChatUser }, dispatch] = useStateProvider();
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [currentPlayBackTime, setCurrentPlayBackTime] = React.useState(0);
  const [totalDuration, setTotalDuration] = React.useState(0);
  const [audioMessage, setAudioMessage] = React.useState(null);

  const waveform = React.useRef(null);
  const waveFormRef = React.useRef(null);

  useEffect(() => {
    if (waveform.current === null) {
      waveform.current = WaveSurfer.create({
        container: waveFormRef.current,
        waveColor: "#ccc",
        progressColor: "#4a9eff",
        cursorColor: "#7ae3c3",
        barWidth: 2,
        height: 30,
        responsive: true,
      });

      waveform.current.on("finish", () => {
        setIsPlaying(false);
      });
    }

    return () => waveform.current.destroy();
  }, []);

  useEffect(() => {
    const audioUrl = `${HOST}/${message.message}`;
    const audio = new Audio(audioUrl);
    setAudioMessage(audio);

    waveform.current.load(audioUrl);

    waveform.current.on("ready", () => {
      setTotalDuration(waveform.current.getDuration());
    });
  }, [message.message]);

  useEffect(() => {
    if (audioMessage) {
      const updatePlayBackTime = () => {
        setCurrentPlayBackTime(audioMessage.currentTime);
      };

      audioMessage.addEventListener("timeupdate", updatePlayBackTime);

      return () => {
        audioMessage.removeEventListener("timeupdate", updatePlayBackTime);
      };
    }
  }, [audioMessage]);

  const handlePlayAudio = () => {
    if (audioMessage && waveform.current) {
      waveform.current.stop();
      waveform.current.play();
      audioMessage.play();
      setIsPlaying(true);
    }
  };

  const handlePauseAudio = () => {
    if (audioMessage && waveform.current) {
      waveform.current.stop();
      audioMessage.pause();
      setIsPlaying(false);
    }
  };

  return (
    <div
      className={`flex items-center gap-5 text-white px4 pr-2 py-4 text-sm rounded-md ${
        ""
        // message.senderId === currentChatUser.id
        //   ? "bg-incoming-background"
        //   : "bg-outgoing-background"
      }`}
    >
      <div>
        <Avatar type={"lg"} image={currentChatUser?.profilePicture} />
      </div>
      <div className={"cursor-pointer text-xl"}>
        {!isPlaying ? (
          <FaPlay onClick={handlePlayAudio} />
        ) : (
          <FaStop onClick={handlePauseAudio} />
        )}
      </div>
      <div className={"relative"}>
        <div className={"w-60"} ref={waveFormRef}></div>
        <div
          className={
            "text-bubble-meta text-[11px] pt-1 flex justify-between absolute bottom-[-22px] w-full"
          }
        >
          <span>
            {formatTime(isPlaying ? currentPlayBackTime : totalDuration)}
          </span>
          <span className={"flex gap-1"}>
            <span>{calculateTime(message.createdAt)}</span>
            {message.senderId === userInfo.id && (
              <MessageStatus messageStatus={message.messageStatus} />
            )}
          </span>
        </div>
      </div>
    </div>
  );
}

export default VoiceMessage;
