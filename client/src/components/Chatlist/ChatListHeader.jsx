import React, { useState } from "react";
import Avatar from "../common/Avatar";
import { useStateProvider } from "@/context/StateContext";
import { BsFillChatLeftFill, BsThreeDotsVertical } from "react-icons/bs";
import { reducerCases } from "@/context/constants";
import ContextMenu from "../common/ContextMenu";
import { useRouter } from "next/router";

function ChatListHeader() {
  const Router = useRouter();
  const [{ userInfo }, dispatch] = useStateProvider();
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
      name: "Logout",
      callback: async () => {
        setIsVisible(false);
        Router.push("/logout");
      },
    },
  ];
  const handleAllContactPage = () => {
    dispatch({
      type: reducerCases.SET_ALL_CONTACTS_PAGE,
      payload: true,
    });
  };

  return (
    <div className="h-16 px-4 py-3 flex justify-between items-center">
      <div className="cursor-pointer">
        <Avatar type={"sm"} image={userInfo?.profileImage} />
      </div>
      <div className="flex gap-6">
        <BsFillChatLeftFill
          className="text-panel-header-icon cursor-pointer text-xl"
          title="New Chat"
          onClick={handleAllContactPage}
        />
        <>
          <BsThreeDotsVertical
            onClick={(e) => showContextMenu(e)}
            id="context-opener"
            title="Menu"
            className="text-panel-header-icon cursor-pointer text-xl"
          />
        </>
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

export default ChatListHeader;
