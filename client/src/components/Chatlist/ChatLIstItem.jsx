import React from "react";
import Avatar from "@/components/common/Avatar";
import { useStateProvider } from "@/context/StateContext";
import { reducerCases } from "@/context/constants";
import { calculateTime } from "@/utils/CalculateTime";
import MessageStatus from "@/components/common/MessageStatus";
import { FaCamera, FaMicrophone } from "react-icons/fa";
import { allMessageStatusSeen } from "@/context/actions";
import axios from "axios";
import { MESSAGE_ROUTE } from "@/utils/ApiRoutes";

function ChatLIstItem({ isContactPage = false, user }) {
  const [{ userInfo, currentChatUser, onlineUsers, socket }, dispatch] =
    useStateProvider();
  const handleContactClick = () => {
    if (isContactPage) {
      dispatch({ type: reducerCases.SET_ALL_CONTACTS_PAGE });
      dispatch({ type: reducerCases.CHANGE_CURRENT_CHAT_USER, user: user });
    } else {
      dispatch({
        type: reducerCases.CHANGE_CURRENT_CHAT_USER,
        user: {
          ...user,
          isCurrentClicked:true
        },
      });

      allMessageStatusSeen(userInfo?.id,dispatch);
    }
  };

  if (currentChatUser && currentChatUser?.isCurrentClicked) {
    console.log("seen-allMessages-Emit");
    if (socket.current) {
      socket.current.emit("seen-allMessages", {
        receiverId: currentChatUser?.id,
        senderId: userInfo?.id,
      });
    }
  }

  return (
    <div
      onClick={handleContactClick}
      className={`flex cursor-pointer items-center hover:bg-background-default-hover`}
    >
      <div className={`min-w-fit px-5 pt-3 pb-1 flex items-center relative`}>
        <Avatar type={"sm"} image={user?.profilePicture} />
        {onlineUsers.includes(user.id) ? (
          <span
            className={`absolute bottom-0 right-4 ml-2 h-3 w-3 rounded-full bg-green-500 animate-pulse `}
            title="Online"
          ></span>
        ) : (
          <span
            className={`absolute bottom-0 right-4 ml-2 h-3 w-3 rounded-full bg-gray-400 animate-pulse`}
            title="Offline"
          ></span>
        )}
      </div>
      <div
        className={"min-h-full flex flex-col justify-center mt-3 pr-2 w-full"}
      >
        <div className={"flex justify-between"}>
          <div>
            <span className={"text-white "}>{user?.name}</span>
          </div>
          {!isContactPage && (
            <div>
              <span
                className={`text-sm ${
                  !user.totalUnreadMessages > 0 || user.senderId === userInfo.id
                    ? "text-secondary"
                    : "text-icon-green"
                }`}
              >
                {calculateTime(user.createdAt)}
              </span>
            </div>
          )}
        </div>
        <div
          className={"flex border-b border-conversation-border pb-2 pt-1 pr-2"}
        >
          <div className={"flex justify-between w-full"}>
            <span className={"text-secondary line-clamp-1 text-sm"}>
              {isContactPage ? (
                user?.about || "\u00A0"
              ) : (
                <div
                  className={
                    "flex items-center gap-1 max-w-[200px] sm:max-w-[250px] md:max-w-[300px] lg:max-w-[200px] xl:max-w-[300px]"
                  }
                >
                  {user?.senderId === userInfo?.id && (
                    <MessageStatus messageStatus={user?.messageStatus} />
                  )}
                  {user.type === "text" && (
                    <span className={"truncate"}>{user.message}</span>
                  )}
                  {user.type === "audio" && (
                    <span className={"flex gap-1 items-center"}>
                      <FaMicrophone className={"text-panel-header-icon"} />
                      Audio
                    </span>
                  )}
                  {user.type === "image" && (
                    <span className={"flex gap-1 items-center"}>
                      <FaCamera className={"text-panel-header-icon"} />
                      Image
                    </span>
                  )}
                </div>
              )}
            </span>
            {user.totalUnreadMessages > 0 && user.senderId !== userInfo.id && (
              <span className={"bg-icon-green px-[5px] rounded-full text-sm"}>
                {user.totalUnreadMessages}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatLIstItem;
