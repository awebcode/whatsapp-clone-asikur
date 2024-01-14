import React from "react";
import { useStateProvider } from "@/context/StateContext";
import Image from "next/image";
import { HOST } from "@/utils/ApiRoutes";
import { calculateTime } from "@/utils/CalculateTime";

function ImageMessage({ message }) {
  const [{ currentChatUser, userInfo }] = useStateProvider();
  return (
    <div
      className={`p-1 rounded-lg ${
        message.senderId === currentChatUser.id
          ? "bg-incoming-background"
          : "bg-outgoing-background"
      }`}
    >
      <div className={"relative"}>
        <Image
          src={`${HOST}/${message.message}`}
          alt={message.id}
          className={"rounded-lg w-auto h-auto"}
          height={300}
          width={300}
        />
        <div className={"absolute bottom-1 right-1 flex items-end gap-1"}>
          <span className={"text-bubble-meta text-[11px] pt-1 min-w-fit"}>
            {calculateTime(message.createdAt)}
          </span>
          <span className={"text-bubble-meta"}></span>
        </div>
      </div>
    </div>
  );
}

export default ImageMessage;
