import React, { useState } from "react";
import Avatar from "../common/Avatar";
import { MdCall } from "react-icons/md";
import { IoVideocam } from "react-icons/io5";
import { BiSearchAlt2 } from "react-icons/bi";
import { BsThreeDotsVertical } from "react-icons/bs";
import { useStateProvider } from "@/context/StateContext";
import { reducerCases } from "@/context/constants";
import ContextMenu from "../common/ContextMenu";
import { useRouter } from "next/router";

function ChatHeader() {
  const [{ currentChatUser, onlineUsers, userInfo }, dispatch] =
    useStateProvider();
  const [contextMenuCordinates, setContextMenuCordinates] = useState({
    x: 0,
    y: 0,
  });
  const [isVisible, setIsVisible] = useState(false);
  const showContextMenu = (e) => {
    e.preventDefault();
    setContextMenuCordinates({ x: e.pageX - 50, y: e.pageY + 20 });
    setIsVisible(true);
  };
  const contextMenuOptions = [
    {
      name: "Exit",
      callback: async () => {
        dispatch({ type: reducerCases.SET_EXIT_CHAT });
      },
    },
  ];
  const router = useRouter();
  console.log({ userInfo });
  const handleVoiceCall = () => {
    dispatch({
      type: reducerCases.SET_VOICE_CALL,
      voiceCall: {
        ...currentChatUser,
        type: "outgoing",
        callType: "voice",
        roomId: Date.now(),
      },
    });
    // router.push(`/room/${userInfo?.id}`);
  };

  const handleVideoCall = () => {
    dispatch({
      type: reducerCases.SET_VIDEO_CALL,
      videoCall: {
        ...currentChatUser,
        type: "outgoing",
        callType: "video",
        roomId: Date.now(),
      },
    });
    // router.push(`/room/${userInfo?.id}`);
  };

  return (
    <div className="h-16 px-4 py-3 flex justify-between items-center bg-panel-header-background z-10 ">
      <div className="flex items-center justify-center gap-6">
        {/* <Avatar type={"sm"} image={currentChatUser?.profilePicture} /> */}

        <div
          className={`min-w-fit px-5 pt-3 pb-1 flex justify-between items-center relative`}
        >
          <Avatar type={"sm"} image={currentChatUser?.profilePicture} />
          {onlineUsers.includes(currentChatUser.id) ? (
            <span
              className={`absolute bottom-0 right-5 ml-2 h-2 w-2 rounded-full bg-green-500 animate-ping`}
              title="Online"
            ></span>
          ) : (
            <span
              className={`absolute bottom-0 right-4 ml-2 h-3 w-3 rounded-full bg-gray-400 animate-pulse`}
              title="Offline"
            ></span>
          )}
        </div>
        <div className="flex flex-col ml-[-24px]">
          <span className="text-primary-strong">{currentChatUser?.name}</span>
          {onlineUsers.includes(currentChatUser.id) ? (
            <span className="text-secondary text-sm">online</span>
          ) : (
            <span className="text-secondary text-sm">offline</span>
          )}{" "}
        </div>
      </div>
      <div className="flex gap-6">
        <MdCall
          className="text-panel-header-icon cursor-pointer text-xl"
          onClick={handleVoiceCall}
        />
        <IoVideocam
          className="text-panel-header-icon cursor-pointer text-xl"
          onClick={handleVideoCall}
        />
        <BiSearchAlt2
          className="text-panel-header-icon cursor-pointer text-xl"
          onClick={() => {
            dispatch({
              type: reducerCases.SET_MESSAGE_SEARCH,
            });
          }}
        />
        <BsThreeDotsVertical
          onClick={(e) => showContextMenu(e)}
          id="context-opener"
          className="text-panel-header-icon cursor-pointer text-xl"
        />

        {isVisible && (
          <ContextMenu
            options={contextMenuOptions}
            coordinates={contextMenuCordinates}
            contextMenu={isVisible}
            setContextMenu={setIsVisible}
          />
        )}
      </div>
    </div>
  );
}

export default ChatHeader;
