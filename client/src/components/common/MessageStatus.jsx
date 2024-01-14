import React from "react";
import { BsCheck, BsCheckAll } from "react-icons/bs";

function MessageStatus({ messageStatus }) {
  return (
    <div>
      {messageStatus === "sent" && <BsCheck className={"text-lg"} />}
      {messageStatus === "delivered" && <BsCheckAll className={"text-lg"} />}
      {["read", "seen"].includes(messageStatus) && (
        <BsCheckAll className="text-lg text-icon-ack" />
      )}
    </div>
  );
}

export default MessageStatus;
