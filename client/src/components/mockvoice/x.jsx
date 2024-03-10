const sendRecording = async () => {
  try {
    // Stop the recording
    mediaRecorderRef.current.stop();

    // Get the recorded audio chunks
    const audioChunks = [];
    mediaRecorderRef.current.addEventListener("dataavailable", (event) => {
      if (event.data.size > 0) {
        audioChunks.push(event.data);
      }
    });

    mediaRecorderRef.current.addEventListener("stop", async () => {
      // Create a Blob from the audio chunks
      const audioBlob = new Blob(audioChunks, { type: "audio/mp3" });
      const audioFile = new File([audioBlob], "audio.mp3", {
        type: "audio/mp3",
      });
      setRenderedAudio(audioFile);

      // Send the recording
      const formData = new FormData();
      formData.append("audio", audioFile);

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
        //delete audio after send
        hide(false);
      }
    });
  } catch (e) {
    console.log(e);
  }
};
