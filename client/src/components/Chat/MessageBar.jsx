import React, { useEffect, useRef, useState } from "react";
import { BsEmojiSmile } from "react-icons/bs";
import { ImAttachment } from "react-icons/im";
import { MdSend } from "react-icons/md";
import { useStateProvider } from "@/context/StateContext";
import axios from "axios";
import { ADD_IMAGE_MESSAGE_ROUTE, ADD_MESSAGE_ROUTE } from "@/utils/ApiRoutes";
import { reducerCases } from "@/context/constants";
import EmojiPicker, { Theme } from "emoji-picker-react";
import PhotoPicker from "@/components/common/PhotoPicker";
import { FaMicrophone } from "react-icons/fa";
import dynamic from "next/dynamic";
import { allMessageStatusSeen } from "@/context/actions";

const CaptureAudio = dynamic(() => import("@/components/common/CaptureAudio"), {
  ssr: false,
});

function MessageBar() {
  const [{ userInfo, currentChatUser, socket }, dispatch] = useStateProvider();
  const [message, setMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAudioRecorder, setShowAudioRecorder] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isTypingGetUser, setIsTypingGetUser] = useState();
  const emojiPickerRef = React.useRef(null);
  const [grabPhoto, setGrabPhoto] = useState(false);

  useEffect(() => {
    if (grabPhoto) {
      document.getElementById("photo-picker").click();
      document.body.onfocus = () => {
        setTimeout(() => {
          setGrabPhoto(false);
        }, 1000);
      };
    }
  }, [grabPhoto]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (event.target.id !== "emoji-picker") {
        if (
          emojiPickerRef.current &&
          !emojiPickerRef.current.contains(event.target)
        ) {
          setShowEmojiPicker(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleEmojiModal = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };

  const handleEmojiClick = (emoji) => {
    setMessage((prev) => prev + emoji.emoji);
  };

  const photoPickerChange = async (e) => {
    try {
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append("image", file);

      const response = await axios.post(ADD_IMAGE_MESSAGE_ROUTE, formData, {
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
        setMessage("");
      }
    } catch (e) {
      console.log(e);
    }
    // const reader = new FileReader();
    //
    // const data = document.createElement("img");
    // reader.onload = (e) => {
    //     data.src = e.target.result;
    //     data.setAttribute("data-src", e.target.result);
    // };
    //
    // reader.readAsDataURL(file);
    // setTimeout(() => {
    //     setImage(data.src);
    // }, 100);
  };

  const sendMessage = async () => {
    try {
      const { data } = await axios.post(ADD_MESSAGE_ROUTE, {
        to: currentChatUser?.id,
        from: userInfo?.id,
        message: message,
      });

      socket.current.emit("msg-send", {
        to: currentChatUser?.id,
        from: userInfo?.id,
        message: data.message,
      });
      socket.current.emit("stopTyping", {
        senderId: userInfo?.id,
        receiverId: currentChatUser?.id,
      });
      dispatch({
        type: reducerCases.UPDATE_LAST_MESSAGE,
        newMessage: data.message?.message,
        user: currentChatUser?.id,
      });
      dispatch({
        type: reducerCases.ADD_MESSAGE,
        newMessage: { ...data.message },
      });

      setMessage("");
    } catch (e) {
      console.log(e);
    }
  };
  
  const typingTimeoutRef = useRef(null);
  const inputChange = (e) => {
    setMessage(e.target.value);

    if (!typing) {
      setTyping(true);
      socket.current?.emit("typing", {
        senderId: userInfo?.id,
        receiverId: currentChatUser?.id,
      });
    }

    // Clear the existing timeout if the user continues typing
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // If the input value is null or empty, stop typing immediately
    if (!e.target.value) {
      socket.current?.emit("stopTyping", {
        senderId: userInfo?.id,
        receiverId: currentChatUser?.id,
      });
      setTyping(false);
      return;
    }

    // Set a new timeout to stop typing after a certain delay (e.g., 3000 milliseconds)
    typingTimeoutRef.current = setTimeout(() => {
      socket.current?.emit("stopTyping", {
        senderId: userInfo?.id,
        receiverId: currentChatUser?.id,
      });
      setTyping(false);
    }, 2000);
  };

  const handleKeyUp = (e) => {
    // Check if the pressed key is Enter (keyCode 13)
    if (e.key === "Enter") {
      sendMessage(); // Call your sendMessage function
      setMessage(""); // Clear the input field or update state accordingly
    }
  };

  const ref = useRef();
  useEffect(() => {
    if (ref.current) {
      ref.current.scrollTop = ref.current.scrollHeight;
    }
  }, [message]);

  useEffect(() => {
    socket.current.on("typing", (data) => {
      setIsTypingGetUser(data);
      setIsTyping(true);
    });
    socket.current.on("stopTyping", () => {
      setIsTyping(false);
    });
  }, []);

  return (
    <>
      {isTyping && isTypingGetUser?.senderId === currentChatUser?.id ? (
        // <span className="animate-pulse my-2 ml-7 text-white bg-transparent text-xl">
        //   Typing...
        // </span>
        <div className="chat-bubble my-2 ml-9 rounded-full">
          {" "}
          <div class="typing rounded-full">
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
          </div>
        </div>
      ) : (
        <></>
      )}
      <div className="bg-panel-header-background h-20 px-4 flex items-center gap-6 relative">
        {!showAudioRecorder && (
          <>
            <div className="flex gap-6">
              <BsEmojiSmile
                className="text-panel-header-icon cursor-pointer text-xl"
                title="Emoji"
                onClick={handleEmojiModal}
                id={"emoji-picker"}
              />
              {showEmojiPicker && (
                <div
                  ref={emojiPickerRef}
                  className={"absolute bottom-24" + " left-16" + " z-40"}
                >
                  <EmojiPicker
                    theme={Theme.DARK}
                    onEmojiClick={handleEmojiClick}
                  />
                </div>
              )}
              <ImAttachment
                className="text-panel-header-icon cursor-pointer text-xl"
                title="Attach File"
                onClick={() => setGrabPhoto(true)}
              />
            </div>
            {}

            <div className="w-full rounded-lg h-10 flex items-center">
              <input
                type="text"
                placeholder="Type a message"
                value={message}
                className="bg-input-background text-sm focus:outline-none text-white h-10 rounded-lg px-5  w-full py-4"
                onChange={inputChange}
                onKeyDown={handleKeyUp}
              />
            </div>

            <div className="flex w-10 items-center justify-center">
              {message.length ? (
                <MdSend
                  className="text-panel-header-icon cursor-pointer text-xl"
                  title="Send Message"
                  onClick={sendMessage}
                />
              ) : (
                <FaMicrophone
                  className="text-panel-header-icon cursor-pointer text-xl"
                  title="Send Message"
                  onClick={() => setShowAudioRecorder(true)}
                />
              )}
            </div>
          </>
        )}
        {grabPhoto && <PhotoPicker onChange={photoPickerChange} />}
        {showAudioRecorder && <CaptureAudio hide={setShowAudioRecorder} />}
      </div>
    </>
  );
}

export default MessageBar;
