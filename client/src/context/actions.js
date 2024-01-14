// actions.js
import { MESSAGE_ROUTE } from "@/utils/ApiRoutes";
import axios from "axios";
import { reducerCases } from "./constants";

export const allMessageStatusSeen = async (userId,dispatch) => {
  try {
    console.log("actionId", userId);

    // Make the HTTP request to update the message status on the server
    await axios.put(`${MESSAGE_ROUTE}/seenALLMessage`);

    // Dispatch the action to update the message status in the Redux state
    dispatch({
      type: reducerCases.ALL_MESSAGE_STATUS_SEEN,
      user: userId,
    });
  } catch (error) {
    // Handle errors if necessary
    console.error("Error updating all message status:", error);
  }
};

export const allMessageStatusDelivered = () => {
  return async (dispatch) => {
    try {
      // Make the HTTP request to update the message status on the server
      await axios.put(`${MESSAGE_ROUTE}/deliveredALLMessage`);

      // Dispatch the action to update the message status in the Redux state
      dispatch({
        type: reducerCases.ALL_MESSAGE_STATUS_DELIVERED,
      });
    } catch (error) {
      // Handle errors if necessary
      console.error("Error updating all message status:", error);
    }
  };
};
