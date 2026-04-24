import useUserStore from "../stores/userStore";
import { useEffect, useState } from "react";
import { getSocket } from "../services/socket";


export function useSocket(currentRoom) {
    const { token, user } = useUserStore();
    const [connected, setConnected] = useState(false);
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        if (!token) return;
        const handleConnect = () => {
            setConnected(true);
        }
        const handleDisconnect = () => {
            setConnected(false);
        }
        const handleConnectError = (err) => {
            console.log("Socket connect error", err.message);
        }
        const handleMessage = (msg) => {
            setMessages((prev) => [...prev, msg]);
        }
        const socket = getSocket(token);
        socket.on("connect", handleConnect);
        socket.on("disconnect", handleDisconnect);
        socket.on("connect_error", handleConnectError);
        socket.on("receive_message", handleMessage);
        return () => {
            // socket.disconnect(); // Don't disconnect here as getSocket might reuse it
            socket.off("connect", handleConnect);
            socket.off("disconnect", handleDisconnect);
            socket.off("connect_error", handleConnectError);
            socket.off("receive_message", handleMessage);
        }
    }, [token]);

    return { connected, messages, setMessages };
}