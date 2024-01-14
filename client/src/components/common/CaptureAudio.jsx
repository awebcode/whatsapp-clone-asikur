import React, { useEffect } from "react";
import {
  FaMicrophone,
  FaPauseCircle,
  FaPlay,
  FaStop,
  FaTrash,
} from "react-icons/fa";
import { useStateProvider } from "@/context/StateContext";
import { MdSend } from "react-icons/md";
import WaveSurfer from "wavesurfer.js";
import axios from "axios";
import {
  ADD_AUDIO_MESSAGE_ROUTE,
  ADD_IMAGE_MESSAGE_ROUTE,
} from "@/utils/ApiRoutes";
import { reducerCases } from "@/context/constants";
import { formatTime } from "@/utils/CalculateTime";

function CaptureAudio({ hide }) {
  const [{ userInfo, currentChatUser, socket }, dispatch] = useStateProvider();

  const [isRecording, setIsRecording] = React.useState(false);
  const [recordedAudio, setRecordedAudio] = React.useState(null);
  const [waveform, setWaveform] = React.useState(null);
  const [recordingDuration, setRecordingDuration] = React.useState(0);
  const [currentPlayBackTime, setCurrentPlayBackTime] = React.useState(0);
  const [totalDuration, setTotalDuration] = React.useState(0);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [renderedAudio, setRenderedAudio] = React.useState(null);

  const audioRef = React.useRef(null);
  const mediaRecorderRef = React.useRef(null);
  const waveFormRef = React.useRef(null);

  useEffect(() => {
    const waveSurfer = WaveSurfer.create({
      container: waveFormRef.current,
      waveColor: "#ccc",
      progressColor: "#4a9eff",
      cursorColor: "#7ae3c3",
      barWidth: 2,
      height: 30,
      responsive: true,
    });

    setWaveform(waveSurfer);

    waveSurfer.on("finish", () => {
      setIsPlaying(false);
    });

    return () => waveSurfer.destroy();
  }, []);

  useEffect(() => {
    if (waveform) {
      handleStartRecording();
    }
  }, [waveform]);

  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingDuration((prev) => {
          setTotalDuration(prev + 1);
          return prev + 1;
        });
      }, 1000);
    }
    return () => {
      clearInterval(interval);
    };
  }, [isRecording]);

  const handleStartRecording = () => {
    setRecordingDuration(0);
    setCurrentPlayBackTime(0);
    setTotalDuration(0);
    setIsRecording(true);

    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioRef.current.srcObject = stream;
        // mediaRecorder.start();

        const audioChunks = [];
        mediaRecorder.addEventListener("dataavailable", (event) => {
          audioChunks.push(event.data);
        });

        mediaRecorder.addEventListener("stop", () => {
          const audioBlob = new Blob(audioChunks, {
            type: "audio/ogg; codecs=opus",
          });
          const audioUrl = URL.createObjectURL(audioBlob);
          const audio = new Audio(audioUrl);
          setRecordedAudio(audio);

          waveform.load(audioUrl);
          audioRef.current = audio;
          // setIsRecording(false);
          // setTotalDuration(audio.duration);
          // setRecordingDuration(0);
          // setCurrentPlayBackTime(0);
        });

        mediaRecorder.start();

        // const timer = setInterval(() => {
        //   setRecordingDuration((prev) => prev + 1);
        // }, 1000);
        //
        // return () => {
        //   clearInterval(timer);
        // };
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      waveform.stop();

      const audioChunks = [];

      mediaRecorderRef.current.addEventListener("dataavailable", (event) => {
        audioChunks.push(event.data);
      });

      mediaRecorderRef.current.addEventListener("stop", () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/mp3" });
        const audioFile = new File([audioBlob], "audio.mp3", {
          type: "audio/mp3",
        });
        setRenderedAudio(audioFile);
      });
    }
  };

  useEffect(() => {
    if (recordedAudio) {
      const updatePlayBackTime = () => {
        setCurrentPlayBackTime(audioRef.current.currentTime);
      };

      recordedAudio.addEventListener("timeupdate", updatePlayBackTime);

      return () => {
        recordedAudio.removeEventListener("timeupdate", updatePlayBackTime);
      };
    }
  }, [recordedAudio]);

  const handlePlayRecording = () => {
    if (recordedAudio) {
      waveform.stop();
      waveform.play();
      recordedAudio.play();
      setIsPlaying(true);
    }
  };

  const handlePauseRecording = () => {
    if (recordedAudio) {
      waveform.stop();
      recordedAudio.pause();
      setIsPlaying(false);
    }
  };

  const sendRecording = async () => {
    try {
      const formData = new FormData();
      formData.append("audio", renderedAudio);
      console.log(formData);

      const response = await axios.post(ADD_AUDIO_MESSAGE_ROUTE, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        params: {
          from: userInfo?.id,
          to: currentChatUser?.id,
        },
      });

      if (response.status === 201) {
        socket.current.emit("msg-send", {
          to: currentChatUser?.id,
          from: userInfo?.id,
          message: response.data.message,
        });
        dispatch({
          type: reducerCases.ADD_MESSAGE,
          newMessage: { ...response.data.message },
        });
      }
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <div className={"flex text-2xl w-full justify-end items-center"}>
      <div className={"pt-1"}>
        <FaTrash
          className={"text-panel-header-icon"}
          onClick={() => hide(false)}
        />
      </div>
      <div
        className={
          "mx-4 py-2 px-4 text-white text-lg flex gap-3 justify-center items-center bg-search-input-container-background rounded-full drop-shadow-lg"
        }
      >
        {isRecording ? (
          <div className={"text-red-500 animate-pulse text-center"}>
            Recording... {formatTime(recordingDuration)}
          </div>
        ) : (
          <div>
            {recordedAudio && (
              <>
                {!isPlaying ? (
                  <FaPlay onClick={handlePlayRecording} />
                ) : (
                  <FaStop onClick={handlePauseRecording} />
                )}
              </>
            )}
          </div>
        )}
        <div className={"w-60"} ref={waveFormRef} hidden={isRecording}></div>
        {recordedAudio && isPlaying && (
          <span>{formatTime(currentPlayBackTime)}</span>
        )}
        {recordedAudio && !isPlaying && (
          <span>{formatTime(totalDuration)}</span>
        )}
      </div>
      <audio ref={audioRef} hidden={true} />

      <div className={"mr-4"}>
        {!isRecording ? (
          <FaMicrophone
            className={"text-red-500"}
            onClick={handleStartRecording}
          />
        ) : (
          <FaPauseCircle
            className={"text-red-500"}
            onClick={handleStopRecording}
          />
        )}
      </div>
      <div>
        <MdSend
          className={"text-panel-header-icon cursor-pointer mr-4"}
          title={"Send"}
          onClick={sendRecording}
        />
      </div>
    </div>
  );
}

export default CaptureAudio;
