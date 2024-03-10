import dynamic from "next/dynamic";

const Room = dynamic(() => import("@/components/Call/room/Room"), { ssr: false });

const MyRoom = () => {
  return (
    <div>
      <Room />
    </div>
  );
};

export default MyRoom;
