import { reducerCases } from "./constants";

export const initialState = {
  userInfo: undefined,
  newUser: false,
  contactsPage: false,
  currentChatUser: undefined,
  messages: [],
  socket: undefined,
  messageSearch: false,
  onlineUsers: [],
  userContacts: [],
  filteredContacts: [],
  searchTerm: "",
  videoCall: undefined,
  voiceCall: undefined,
  incomingVoiceCall: undefined,
  incomingVideoCall: undefined,
  name:"Asikur"
};

const reducer = (state, action) => {
  switch (action.type) {
    case reducerCases.SET_USER_INFO: {
      return {
        ...state,
        userInfo: action.userInfo,
      };
    }
    case reducerCases.SET_NEW_USER: {
      return {
        ...state,
        newUser: action.newUser,
      };
    }
    case reducerCases.SET_ALL_CONTACTS_PAGE: {
      return {
        ...state,
        contactsPage: !state.contactsPage,
      };
    }
    case reducerCases.CHANGE_CURRENT_CHAT_USER: {
      return {
        ...state,
        currentChatUser: action.user,
      };
    }
    case reducerCases.SET_MESSAGES: {
      return {
        ...state,
        messages: action.messages,
      };
    }
    case reducerCases.SET_SOCKET: {
      return {
        ...state,
        socket: action.socket,
      };
    }
    case reducerCases.ADD_MESSAGE: {
      return {
        ...state,
        messages: [...state.messages, action.newMessage],
      };
    }
    case reducerCases.ADD_MESSAGES_BOTTOM||
       reducerCases.ADD_MESSAGES_TOP: {
      return {
        ...state,
        messages: [...state.messages, action.messages],
      };
    }
    case reducerCases.SET_MESSAGE_SEARCH: {
      return {
        ...state,
        messageSearch: !state.messageSearch,
      };
    }
    case reducerCases.SET_ONLINE_USERS: {
      return {
        ...state,
        onlineUsers: action.onlineUsers,
      };
    }
    case reducerCases.SET_CONTACTS: {
      return {
        ...state,
        userContacts: action.userContacts,
      };
    }
    case reducerCases.SET_CONTACTS_SEARCH: {
      const filteredContacts = state.userContacts.filter((contact) => {
        return contact.name
          .toLowerCase()
          .includes(action.searchTerm.trim().toLowerCase());
      });
      return {
        ...state,
        searchTerm: action.searchTerm,
        filteredContacts: filteredContacts,
      };
    }
    case reducerCases.SET_VIDEO_CALL: {
      return {
        ...state,
        videoCall: action.videoCall,
      };
    }
    case reducerCases.SET_VOICE_CALL: {
      return {
        ...state,
        voiceCall: action.voiceCall,
      };
    }
    case reducerCases.END_CALL: {
      return {
        ...state,
        videoCall: undefined,
        voiceCall: undefined,
        incomingVoiceCall: undefined,
        incomingVideoCall: undefined,
      };
    }
    case reducerCases.SET_EXIT_CHAT: {
      return {
        ...state,
        currentChatUser: undefined,
      };
    }
    case reducerCases.SET_INCOMING_VOICE_CALL: {
      return {
        ...state,
        incomingVoiceCall: action.incomingVoiceCall,
      };
    }
    case reducerCases.SET_INCOMING_VIDEO_CALL: {
      return {
        ...state,
        incomingVideoCall: action.incomingVideoCall,
      };
    }
    //

    case reducerCases.UPDATE_LAST_MESSAGE: {
      const { user, newMessage } = action;
      const currentChatUserIndex = state?.userContacts?.findIndex(
        (currentUser) => currentUser.id === user,
      );

      if (currentChatUserIndex !== -1) {
        // Update the last message for the specific user
        const updatedUserContacts = [
          { ...state.userContacts[currentChatUserIndex], message: newMessage }, // Move the updated user to the top
          ...state.userContacts.slice(0, currentChatUserIndex),
          ...state.userContacts.slice(currentChatUserIndex + 1),
        ];

        return {
          ...state,
          userContacts: updatedUserContacts,
        };
      }
    }
    case reducerCases.SEEN_MESSAGE_STATUS: {
      const currentChatUserIndex = state?.userContacts?.findIndex(
        (user) => user.id === action.user,
      );
      // Ensure the user is found before attempting to update
      if (currentChatUserIndex !== -1) {
        // Update the last message for the specific user
        const updatedUserContacts = [...state?.userContacts];
        updatedUserContacts[currentChatUserIndex].messageStatus = "seen";

        return {
          ...state,
          userContacts: updatedUserContacts,
        };
      }
    }
    case reducerCases.DELIVERED_MESSAGE_STATUS: {
      const currentChatUserIndex = state?.userContacts?.findIndex(
        (user) => user.id === action.user,
      );
      // Ensure the user is found before attempting to update
      if (currentChatUserIndex !== -1) {
        // Update the last message for the specific user
        const updatedUserContacts = [...state?.userContacts];
        updatedUserContacts[currentChatUserIndex].messageStatus = "delivered";

        return {
          ...state,
          userContacts: updatedUserContacts,
        };
      }
    }
    //all messages status seen/delivered

    case reducerCases.ALL_MESSAGE_STATUS_SEEN: {
      // Update the message status for all messsages to "seen"

      const currentChatUserIndex = state?.userContacts?.findIndex(
        (user) => user.id === action.user,
      );
      if (currentChatUserIndex !== -1) {
        //
        const updatedUserContacts = [...state?.userContacts];
        updatedUserContacts[currentChatUserIndex].messageStatus = "seen";
        console.log(
          "all messsages to seen",
          updatedUserContacts[currentChatUserIndex],
        );
        updatedUserContacts[currentChatUserIndex].totalUnreadMessages = 0;
        return {
          ...state,
          userContacts: updatedUserContacts,
        };
      }
    }

    case reducerCases.ALL_MESSAGE_STATUS_DELIVERED: {
      // Update the message status for all users to "delivered"
      const updatedUserContacts = state?.userContacts?.map((user) => ({
        ...user,
        messageStatus: "delivered",
      }));

      return {
        ...state,
        userContacts: updatedUserContacts,
      };
    }

    default: {
      return state;
    }
  }
};

export default reducer;
