import { useStateProvider } from "@/context/StateContext";
import { reducerCases } from "@/context/constants";
import { CHECK_USER_ROUTE } from "@/utils/ApiRoutes";
import { firebaseAuth } from "@/utils/FirebaseConfig";
import axios from "axios";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import Image from "next/image";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
import { FcGoogle } from "react-icons/fc";

function login() {
  const router = useRouter();

  const [{ userInfo }, dispatch] = useStateProvider();

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: "select_account",
    });

    try {
      const {
        user: { displayName: name, email, photoURL: profileImage },
        operationType,
      } = await signInWithPopup(firebaseAuth, provider);

      if (email) {
        const { data } = await axios.post(CHECK_USER_ROUTE, {
          email,
        });

        console.log(data);

        if (!data.user) {
          dispatch({
            type: reducerCases.SET_NEW_USER,
            newUser: true,
          });
          dispatch({
            type: reducerCases.SET_USER_INFO,
            userInfo: {
              name,
              email,
              status: "",
            },
          });
          await router.push("/onboarding");
        } else {
          dispatch({
            type: reducerCases.SET_NEW_USER,
            newUser: false,
          });
          dispatch({
            type: reducerCases.SET_USER_INFO,
            userInfo: {
              id: data.user.id,
              name: data.user.name,
              email,
              profileImage: data.user.profilePicture,
              about: data.user.about,
              status: data.status,
            },
          });
          console.log(data.user);
          // await router.push("/");
        }
      }
    } catch (err) {
      console.log(err);
    }
  };
  console.log("userInfor", userInfo);
  // useEffect(() => {
  //   if (userInfo === undefined) {
  //     router.push("/");
  //   }
  // }, [router]);

  return (
    <div className="flex justify-center items-center bg-panel-header-background h-screen w-screen flex-col gap-6">
      <div className="flex items-center justify-center gap-2 text-white ">
        <Image
          src={"/whatsapp.gif"}
          alt="whatsapp"
          height={300}
          width={300}
          priority
        />
        <span className="text-7xl">Whatsapp</span>
      </div>
      <button
        className="flex items-center justify-center gap-7 bg-search-input-container-background p-5 rounded-lg"
        onClick={handleLogin}
      >
        <FcGoogle className="text-4xl" />
        <span className="text-white text-2xl">Login With Google</span>
      </button>
    </div>
  );
}

export default login;
