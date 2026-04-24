import { useEffect } from "react";
import useUserStore from "../stores/userStore";
import useChatStore from "../stores/chatStore";
import { getSocket } from "../services/socket";
import { apiGetParties } from "../api/party";

export function useGlobalSocket() {
  const { token, user } = useUserStore();
  const incrementUnread = useChatStore((state) => state.incrementUnread);


  useEffect(() => {
    if (!token || !user?.id) return;

    const socket = getSocket(token);


    const initSocketRooms = async () => {
      try {
        const res = await apiGetParties();
        const parties = res.data?.data || [];
        parties.forEach((party) => {
          socket.emit("join_room", party.id);
        });
      } catch (error) {
        console.error("Failed to fetch parties for socket initialization", error);
      }
    };

    initSocketRooms();

    // unread function ja
    const handleGlobalMessage = (msg) => {
      if (msg.userId !== user.id) {
        incrementUnread(msg.partyId);
      }
    };

    socket.on("receive_message", handleGlobalMessage);

    return () => {
      socket.off("receive_message", handleGlobalMessage);
    };
  }, [token, user?.id, incrementUnread]);
}
