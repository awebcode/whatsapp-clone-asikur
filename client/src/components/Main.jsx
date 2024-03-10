import React, { useEffect, useRef, useState } from "react";
import ChatList from "./Chatlist/ChatList";
import Empty from "./Empty";
import { onAuthStateChanged } from "firebase/auth";
import { firebaseAuth } from "@/utils/FirebaseConfig";
import { useStateProvider } from "@/context/StateContext";
import axios from "axios";
import {
  CHECK_USER_ROUTE,
  GET_MESSAGES_ROUTE,
  HOST,
  MESSAGE_ROUTE,
} from "@/utils/ApiRoutes";
import { useRouter } from "next/router";
import { reducerCases } from "@/context/constants";
import Chat from "./Chat/Chat";
import { io } from "socket.io-client";
import SearchMessages from "@/components/Chat/SearchMessages";
import VideoCall from "@/components/Call/VideoCall";
import VoiceCall from "@/components/Call/VoiceCall";
import IncomingVideoCall from "@/components/common/IncomingVideoCall";
import IncomingCall from "@/components/common/IncomingCall";
import { allMessageStatusSeen } from "@/context/actions";

function Main() {
  const [redirectLogin, setRedirectLogin] = useState(false);
  const [incomingMessage, setIncomingMessage] = useState(undefined);
  const [
    {
      userInfo,
      currentChatUser,
      messageSearch,
      videoCall,
      voiceCall,
      incomingVoiceCall,
      incomingVideoCall,
      onlineUsers,
    },
    dispatch,
  ] = useStateProvider();
  const [socketEvent, setSocketEvent] = useState(false);

  // const [socket, setSocket] = useState(io(HOST));
  let socket = useRef(null);
  const ref = useRef(false);
  const router = useRouter();

  useEffect(() => {
    if (redirectLogin) {
      router.push("/login").then((r) => {});
    }
  }, [redirectLogin]);

  onAuthStateChanged(firebaseAuth, async (user) => {
    if (!user) {
      setRedirectLogin(true);
    }

    if (!userInfo && user?.email) {
      const { data } = await axios.post(CHECK_USER_ROUTE, {
        email: user.email,
      });

      if (!data.status) {
        const { displayName: name, photoURL: profileImage, email } = user;
      //  console.log("CHECK_USER_ROUTE", data);

        dispatch({
          type: reducerCases.SET_NEW_USER,
          newUser: true,
        });
        dispatch({
          type: reducerCases.SET_USER_INFO,
          userInfo: {
            name,
            email,
            status: "",
          },
        });
        await router.push("/onboarding");
      } else {
        dispatch({
          type: reducerCases.SET_NEW_USER,
          newUser: false,
        });

        dispatch({
          type: reducerCases.SET_USER_INFO,
          userInfo: {
            id: data.user.id,
            name: data.user.name,
            email: data.user.email,
            profileImage: data.user.profilePicture,
            about: data.user.about,
            status: data.status,
          },
        });
      }
    }
  });

  useEffect(() => {
    if (userInfo) {
      socket.current = io(HOST);
      socket.current.emit("add-user", userInfo.id);
      dispatch({
        type: reducerCases.SET_SOCKET,
        socket: socket,
      });
    }
  }, [userInfo]);

  

  useEffect(() => {
    if (socket.current && !socketEvent) {
      socket.current.on("msg-receive", (data) => {
        dispatch({
          type: reducerCases.ADD_MESSAGE,
          newMessage: { ...data.message },
        });
        dispatch({
          type: reducerCases.UPDATE_LAST_MESSAGE,
          newMessage: data.message?.message,
          user: data.message?.senderId,
        });
        setIncomingMessage(data.message);
      });

      socket.current.on("incoming-voice-call", (data) => {
        dispatch({
          type: reducerCases.SET_INCOMING_VOICE_CALL,
          incomingVoiceCall: {
            ...data.from,
            callType: data.callType,
            roomId: data.roomId,
          },
        });
      });

      socket.current.on("incoming-video-call", (data) => {
        console.log("Incoming video call: ", data);
        dispatch({
          type: reducerCases.SET_INCOMING_VIDEO_CALL,
          incomingVideoCall: {
            ...data.from,
            callType: data.callType,
            roomId: data.roomId,
          },
        });
      });

      socket.current.on("voice-call-rejected", (data) => {
        dispatch({
          type: reducerCases.END_CALL,
        });
      });

      socket.current.on("video-call-rejected", (data) => {
        dispatch({
          type: reducerCases.END_CALL,
          videoCall: undefined,
          voiceCall: undefined,
          incomingVideoCall: undefined,
          incomingVoiceCall: undefined,
        });
      });

      socket.current.on("online-users", ({ onlineUsers }) => {
        dispatch({
          type: reducerCases.SET_ONLINE_USERS,
          onlineUsers,
        });
      });

      //seen all response back

      setSocketEvent(true);
    }
  }, [socket.current]);

  useEffect(() => {
    if (incomingMessage && currentChatUser) {
      const seenMessage = async () => {
        const { data } = await axios.put(
          `${MESSAGE_ROUTE}/seenMessage/${incomingMessage.id}`,
        );
        return data;
      };

      socket.current.emit("seen-message", {
        to: currentChatUser?.id,
        from: userInfo?.id,
      });

      return () => seenMessage();
    }
  }, [incomingMessage]);
  useEffect(() => {
    if (socket.current) {
      socket.current.on("seen-message-receive", (data) => {
        console.log("seenMessageReceived", data);
        dispatch({
          type: reducerCases.SEEN_MESSAGE_STATUS,
          user: userInfo?.id,
        });
      });
    }
    if (onlineUsers?.includes(userInfo?.id) && incomingMessage) {
      socket.current.emit("delivered-message", {
        to: currentChatUser?.id,
        from: userInfo?.id,
      });
      const deliveredMessage = async () => {
        const { data } = await axios.put(
          `${MESSAGE_ROUTE}/deliveredMessage/${incomingMessage.id}`,
        );
        return data;
      };

      return () => deliveredMessage();
    }
  }, [socket.current]);

  useEffect(() => {
    const getMessages = async () => {
      try {
        const { data } = await axios.get(
          `${GET_MESSAGES_ROUTE}/${userInfo.id}/${currentChatUser.id}`,
        );
        // console.log(data.messages);
        if (data.messages instanceof Array) {
          dispatch({
            type: reducerCases.SET_MESSAGES,
            messages: data.messages,
          });
        }
      } catch (e) {
        // console.log(e);
      }
    };

    if (userInfo?.id && currentChatUser?.id) {
      getMessages().then((r) => {});
    }
  }, [currentChatUser]);

  //seen-all-messages
  console.log({currentChatUser})
  return (
    <>
      {incomingVideoCall && <IncomingVideoCall />}
      {incomingVoiceCall && <IncomingCall />}

      {videoCall && (
        <div className={"h-screen w-screen max-h-full overflow-hidden"}>
          <VideoCall />
        </div>
      )}
      {voiceCall && (
        <div className={"h-screen w-screen max-h-full overflow-hidden"}>
          <VoiceCall />
        </div>
      )}
      {!videoCall && !voiceCall && (
        <div className="grid grid-cols-main h-screen w-screen max-h-screen max-w-full overflow-hidden ">
          <ChatList />
          {currentChatUser && currentChatUser?.id ? (
            <div className={messageSearch ? "grid grid-cols-2" : "grid-cols-2"}>
              <Chat />
              {messageSearch && <SearchMessages />}
            </div>
          ) : (
            <Empty />
          )}
        </div>
      )}
    </>
  );
}

export default Main;
