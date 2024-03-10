import { useStateProvider } from "@/context/StateContext";
import { HOST } from "@/utils/ApiRoutes";
import { useEffect, useRef, useState } from "react";
import { FaPlay, FaStop } from "react-icons/fa";
import Avatar from "../common/Avatar";
import MessageStatus from "../common/MessageStatus";
import { calculateTime, formatTime } from "@/utils/CalculateTime";
import WaveSurfer from "wavesurfer.js";

// styles

const formWaveSurferOptions = (ref) => ({
  container: ref,
  waveColor: "#7ae3c3",
  progressColor: "#4a9eff",
  cursorColor: "#ddd",
  barWidth: 4,
  barRadius: 3,
  height: 50,
  responsive: true,
  normalize: true,
  partialRender: true,
});

export default function VoiceMessage({ message }) {
  const [{ userInfo, currentChatUser }, dispatch] = useStateProvider();
  const waveformRef = useRef(null);
  const wavesurfer = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState("00:00");
  const [totalTime, setTotalTime] = useState("00:00");

  const url = `${HOST}/${message.message}`;

  useEffect(() => {
    // Create WaveSurfer instance when the component mounts
    wavesurfer.current = WaveSurfer.create(
      formWaveSurferOptions(waveformRef.current),
    );
    wavesurfer.current.load(url);

    // Set up event listeners
    wavesurfer.current.on("play", () => setPlaying(true));
    wavesurfer.current.on("pause", () => setPlaying(false));
    wavesurfer.current.on("audioprocess", () => {
      setCurrentTime(formatTime(wavesurfer.current.getCurrentTime()));
    });
    wavesurfer.current.on("ready", () => {
      setTotalTime(formatTime(wavesurfer.current.getDuration()));
    });

    // Cleanup: Destroy WaveSurfer instance when the component unmounts
    return () => {
      if (wavesurfer.current) {
        wavesurfer.current.destroy();
      }
    };
  }, [url]); // Ensure useEffect runs when url changes

  const handlePlayAudio = () => {
    // Placeholder for play audio logic
    wavesurfer.current.play();
  };

  const handlePauseAudio = () => {
    // Placeholder for pause audio logic
    wavesurfer.current.pause();
  };

  return (
    <div
      className={`flex items-center gap-5 text-white px4 pr-2 py-4 text-sm rounded-md`}
    >
      <div>
        <Avatar type={"lg"} image={currentChatUser?.profilePicture} />
      </div>
      <div className={"cursor-pointer text-xl"}>
        {!playing ? (
          <FaPlay onClick={handlePlayAudio} />
        ) : (
          <FaStop onClick={handlePauseAudio} />
        )}
      </div>
      <div className={"relative"}>
        <div className={"w-60"} ref={waveformRef}></div>
        <div
          className={
            "text-bubble-meta text-[11px] pt-1 flex justify-between absolute bottom-[-22px] w-full"
          }
        >
          <span className="text-sm font-medium">
            {playing ? currentTime : totalTime}
          </span>
          <span className={"flex gap-1 text-sm font-medium "}>
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
