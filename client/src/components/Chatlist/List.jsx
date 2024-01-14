import React, { useEffect } from "react";
import { useStateProvider } from "@/context/StateContext";
import axios from "axios";
import { GET_INITIAL_CONTACTS_ROUTE } from "@/utils/ApiRoutes";
import { reducerCases } from "@/context/constants";
import ChatLIstItem from "@/components/Chatlist/ChatLIstItem";
import { allMessageStatusSeen } from "@/context/actions";

function List() {
  const [
    { userInfo, userContacts, filteredContacts, searchTerm, socket },
    dispatch,
  ] = useStateProvider();
  console.log("socket",socket?.current)

  useEffect(() => {
    const getContacts = async () => {
      if (userInfo) {
        try {
          // console.log("GET_INITIAL_CONTACTS_ROUTE");
          const {
            data: { users, onlineUsers },
          } = await axios.get(`${GET_INITIAL_CONTACTS_ROUTE}/${userInfo?.id}`);

          dispatch({
            type: reducerCases.SET_ONLINE_USERS,
            onlineUsers: onlineUsers,
          });
          dispatch({ type: reducerCases.SET_CONTACTS, userContacts: users });

          console.log("initUsers", users);
          console.log(onlineUsers);
        } catch (error) {
          console.log(error);
        }
      }
    };

    getContacts();
  }, [userInfo]);
  useEffect(() => {
    socket?.current.on("seen-allMessages-received", (data) => {
      console.log("seenAllReceivedData", data);
      allMessageStatusSeen(data.to, dispatch);
    });

    dispatch({
      type: reducerCases.CHANGE_CURRENT_CHAT_USER,
      user: {
        isCurrentClicked: false,
      },
    });
  }, []);
  return (
    <div className="bg-search-input-container-background flex-auto overflow-auto max-h-full custom-scrollbar">
      {filteredContacts && searchTerm.length > 0
        ? filteredContacts.map((contact) => (
            <ChatLIstItem key={contact.id} user={contact} />
          ))
        : userContacts &&
          userContacts.map((contact) => (
            <ChatLIstItem key={contact.id} user={contact} />
          ))}
    </div>
  );
}

export default List;
