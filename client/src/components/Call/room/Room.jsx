import React from "react";
import {
  RightPanelExpandedType,
  ScenarioModel,
  ZegoUIKitPrebuilt,
} from "@zegocloud/zego-uikit-prebuilt";
import { useRouter } from "next/router";
import { useStateProvider } from "@/context/StateContext";
import { onAuthStateChanged } from "firebase/auth";
import { firebaseAuth } from "@/utils/FirebaseConfig";
import axios from "axios";
import { CHECK_USER_ROUTE } from "@/utils/ApiRoutes";
import { reducerCases } from "@/context/constants";
const Room = () => {
  const [{ userInfo }, dispatch] = useStateProvider();
  const router = useRouter();
  const roomId = router.query.roomId;

  onAuthStateChanged(firebaseAuth, async (user) => {
    if (!user) {
      return;
    }

    if (!userInfo && user?.email) {
      const { data } = await axios.post(CHECK_USER_ROUTE, {
        email: user.email,
      });

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
  });

  const meeting = (element) => {
    const appid = 860014501;
    const serverSecret = "458b61f8e100220cfce77a83ce180615";
    const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
      appid,
      serverSecret,
      roomId,
      Date.now().toString(),
      userInfo?.name,
    );

    const zp = ZegoUIKitPrebuilt.create(kitToken);

    zp?.joinRoom({
      container: element,
      scenario: { mode: ScenarioModel?.GroupCall },
      sharedLinks: [
        {
          name: "Copy Join Link",
          url: "http://localhost:3000" + router.asPath,
        },
      ],

      showRoomTimer: true, // Whether to display the timer. Not displayed by default.
      showRoomDetailsButton: true, // Whether to display the button that is used to check the room details. Displayed by default.
      showInviteToCohostButton: true, // Whether to show the button that is used to invite the audience to co-host on the host end.
      showRemoveCohostButton: true, // Whether to show the button that is used to remove the audience on the host end.
      showRequestToCohostButton: true, // Whether to show the button that is used to request to co-host on the audience end.
      rightPanelExpandedType: RightPanelExpandedType, // Controls the type of the information displayed on the right panel, display "None" by default.
      autoHideFooter: true, // Whether to automatically hide the footer (bottom toolbar), auto-hide by default. This only applies to mobile browsers.
      enableUserSearch: true, // Whether to enable the user search feature, false by default.
      branding: {
        logoURL:
          "https://img.freepik.com/free-vector/bird-colorful-logo-gradient-vector_343694-1365.jpg?size=338&ext=jpg&ga=GA1.1.1395880969.1709856000&semt=sph", // The branding LOGO URL.
      },
      // 1.4 Leaving view
      showLeavingView: true, // Whether to display the leaving view. Displayed by default.
      showLayoutButton: true, // Whether to display the button for switching layouts. Displayed by default.
      showNonVideoUser: true, // Whether to display the non-video participants. Displayed by default.
      showOnlyAudioUser: true, // Whether to display audio-only participants. Displayed by default.
      showLeaveRoomConfirmDialog: true, // When leaving the room, whether to display a confirmation pop-up window, the default is true
    });
  };
  return <div ref={meeting} className="min-h-screen w-screen"></div>;
};

export default Room;
