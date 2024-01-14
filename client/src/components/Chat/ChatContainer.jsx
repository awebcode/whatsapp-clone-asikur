// import React from "react";
// import { useStateProvider } from "@/context/StateContext";
// import { calculateTime } from "@/utils/CalculateTime";
// import MessageStatus from "@/components/common/MessageStatus";
// import ImageMessage from "@/components/Chat/ImageMessage";
// import dynamic from "next/dynamic";
// // import VoiceMessage from "@/components/Chat/VoiceMessage";
// const VoiceMessage = dynamic(() => import("@/components/Chat/VoiceMessage"), {
//   ssr: false,
// });

// function ChatContainer() {
//   const [{ messages, currentChatUser, userInfo }, dispatch] =
//     useStateProvider();
//   return (
//     <div className="h-[80vh] w-full relative flex flex-col flex-grow overflow-y-auto custom-scrollbar">
//       <div
//         className="absolute bg-chat-background
//        bg-fixed h-full w-full opacity-5 flex left-0 top-0 z-0"
//       ></div>
//       <div
//         className={
//           "w-full h-full px-10 py-6 flex flex-col overflow-y-auto custom-scrollbar relative gap-1"
//         }
//       >
//         {messages.map((message, index) => (
//           <div
//             key={index}
//             className={`flex ${
//               message.senderId === currentChatUser.id
//                 ? "justify-start"
//                 : "justify-end"
//             }`}
//           >
//             {message.type === "text" && (
//               <div
//                 className={`text-white px-2 py-[5px] text-sm rounded-md flex gap-2 items-end max-w-[45%] ${
//                   message.senderId === currentChatUser.id
//                     ? "bg-incoming-background"
//                     : "bg-outgoing-background"
//                 }`}
//               >
//                 <span className={"break-all"}>{message.message}</span>
//                 <span className={"text-bubble-meta text-[11px] pt-1 min-w-fit"}>
//                   {calculateTime(message.createdAt)}
//                 </span>
//                 <span>
//                   {message.senderId === userInfo.id && (
//                     <MessageStatus messageStatus={message.messageStatus} />
//                   )}
//                 </span>
//               </div>
//             )}
//             {message.type === "image" && <ImageMessage message={message} />}
//             {message.type === "audio" && <VoiceMessage message={message} />}
//           </div>
//         ))}
//       </div>
//       {/*<div className={"mx-10 h-full my-6 relative"}>*/}
//       {/*  <div className="flex w-full ">*/}
//       {/*    <div className="flex flex-col justify-end w-full gap-1 overflow-auto">*/}
//       {/*      {messages.map((message, index) => (*/}
//       {/*        <div*/}
//       {/*          key={index}*/}
//       {/*          className={`flex ${*/}
//       {/*            message.senderId === currentChatUser.id*/}
//       {/*              ? "justify-start"*/}
//       {/*              : "justify-end"*/}
//       {/*          }`}*/}
//       {/*        >*/}
//       {/*          {message.type === "text" && (*/}
//       {/*            <div*/}
//       {/*              className={`text-white px-2 py-[5px] text-sm rounded-md flex gap-2 items-end max-w-[45%] ${*/}
//       {/*                message.senderId === currentChatUser.id*/}
//       {/*                  ? "bg-incoming-background"*/}
//       {/*                  : "bg-outgoing-background"*/}
//       {/*              }`}*/}
//       {/*            >*/}
//       {/*              <span className={"break-all"}>{message.message}</span>*/}
//       {/*              <span*/}
//       {/*                className={"text-bubble-meta text-[11px] pt-1 min-w-fit"}*/}
//       {/*              >*/}
//       {/*                {calculateTime(message.createdAt)}*/}
//       {/*              </span>*/}
//       {/*              <span>*/}
//       {/*                {message.senderId === userInfo.id && (*/}
//       {/*                  <MessageStatus messageStatus={message.messageStatus} />*/}
//       {/*                )}*/}
//       {/*              </span>*/}
//       {/*            </div>*/}
//       {/*          )}*/}
//       {/*          {message.type === "image" && <ImageMessage message={message} />}*/}
//       {/*        </div>*/}
//       {/*      ))}*/}
//       {/*    </div>*/}
//       {/*  </div>*/}
//       {/*</div>*/}
//     </div>
//   );
// }

// export default ChatContainer;
"use client";
import React, { useEffect, useRef, useState } from "react";
import { useStateProvider } from "@/context/StateContext";
import { calculateTime } from "@/utils/CalculateTime";
import MessageStatus from "@/components/common/MessageStatus";
import ImageMessage from "@/components/Chat/ImageMessage";
import dynamic from "next/dynamic";
import { reducerCases } from "@/context/constants";
import { IoArrowDown, IoArrowDownCircleOutline } from "react-icons/io5";
const VoiceMessage = dynamic(() => import("@/components/Chat/VoiceMessage"), {
  ssr: false,
});

function ChatContainer() {
  const [{ messages, currentChatUser, userInfo }, dispatch] =
    useStateProvider();
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    // Fetch initial messages (assuming a function fetchInitialMessages exists)
    fetchInitialMessages();

    // Attach scroll event listener to container
    if (containerRef.current)
      containerRef.current.addEventListener("scroll", handleScroll);

    // Cleanup: Remove event listener on component unmount
    return () => {
      if (containerRef.current)
        containerRef.current.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const fetchInitialMessages = () => {
    // Simulate fetching initial messages
    setLoading(true);
    setTimeout(() => {
      const initialMessages = [...Array(10).keys()].map((index) => ({
        id: index,
        text: `Message ${index + 1}`,
      }));
      dispatch({
        type: reducerCases.ADD_MESSAGES_BOTTOM,
        messages: initialMessages,
      });
      setLoading(false);
    }, 1000);
  };

  const fetchMoreMessages = () => {
    // Simulate fetching older messages
    setLoading(true);
    setTimeout(() => {
      const olderMessages = [...Array(10).keys()].map((index) => ({
        id: messages.length + index,
        text: `Older Message ${messages.length + index + 1}`,
      }));
      dispatch({
        type: reducerCases.ADD_MESSAGES_TOP,
        messages: olderMessages,
      });
      setLoading(false);
    }, 1000);
  };

  const [showScrollToBottomButton, setShowScrollToBottomButton] =
    useState(false);

  const handleScroll = () => {
    const container = containerRef.current;

    // Check if the user has scrolled to the top
    if (container?.scrollTop === 0 && !loading) {
      // Fetch more messages if the user is at the top
      fetchMoreMessages();
    }
  };

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    const handleScroll = () => {
      const container = containerRef.current;

      if (container) {
        const isAtBottom =
          container.scrollHeight - container.clientHeight <=
          container.scrollTop + 1;

        setShowScrollToBottomButton(!isAtBottom);
      }
    };

    const container = containerRef.current;

    if (container) {
      container.addEventListener("scroll", handleScroll, { passive: true });
    }

    return () => {
      if (container) {
        container.removeEventListener("scroll", handleScroll, {
          passive: true,
        });
      }
    };
  }, [messages]); // Re-run the effect when messages change

  //scroll to bottom of container
  const scrollToBottom = () => {
    // Use scrollIntoView to scroll to the bottom of the container
    containerRef.current?.lastChild?.scrollIntoView({ behavior: "smooth" });
  };
  if (loading) {
    return (
      <div className="animate-spin h-6 w-6 border border-gray-100 rounded m-6 p-6 flex justify-center items-center">
        {" "}
        Loading
      </div>
    );
  }

  return (
    <div className="h-[80vh] w-full relative flex flex-col flex-grow overflow-y-auto custom-scrollbar">
      <div className="absolute bg-chat-background bg-fixed h-full w-full opacity-5 flex left-0 top-0 z-0"></div>
      <div
        ref={containerRef}
        className={
          "w-full h-full px-10 py-6 flex flex-col overflow-y-auto custom-scrollbar relative gap-1"
        }
      >
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.senderId === currentChatUser.id
                ? "justify-start"
                : "justify-end"
            }`}
          >
            {message.type === "text" && (
              <div
                className={`text-white px-2 py-[5px] text-sm rounded-md flex gap-2 items-end max-w-[45%] ${
                  message.senderId === currentChatUser.id
                    ? "bg-incoming-background"
                    : "bg-outgoing-background"
                }`}
              >
                <span className={"break-all"}>{message.message}</span>
                <span className={"text-bubble-meta text-[11px] pt-1 min-w-fit"}>
                  {calculateTime(message.createdAt)}
                </span>
                <span>
                  {message.senderId === userInfo.id && (
                    <MessageStatus messageStatus={message.messageStatus} />
                  )}
                </span>
              </div>
            )}
            {showScrollToBottomButton && (
              <button
                onClick={scrollToBottom}
                className="fixed flex items-center z-50 bottom-24  right-4 bg-gray-800 text-white p-3 rounded-full hover:bg-gray-500 focus:outline-none"
              >
                <IoArrowDown className="w-5 h-5 mt-1 animate-bounce text-green-400" />
              </button>
            )}
            {message.type === "image" && <ImageMessage message={message} />}
            {message.type === "audio" && <VoiceMessage message={message} />}
          </div>
        ))}
        {/* {loading && <div>Loading...</div>} */}
      </div>
    </div>
  );
}

export default ChatContainer;
