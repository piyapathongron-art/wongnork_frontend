import { io } from "socket.io-client";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

let socket = null;
let currenToken = null;

export function getSocket(token) {

    if (socket && currenToken === token) {
        return socket;
    }

    if (socket) {
        socket.disconnect();
        socket = null
    }

    currenToken = token;

    socket = io(BACKEND_URL, {
        auth: { token },
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
    })

    socket.on("connect", () => {
        console.log("socket connected", socket?.id);
    })

    socket.on("disconnect", () => {
        console.log("socket disconnected");
    })

    socket.on("connect_error", (err) => {
        console.log("socket connect error", err.message);
    })

    return socket;

}

export function disconnectedSocket() {
    if (socket) {
        socket.disconnect();
        socket = null;
        currenToken = null;
        console.log("Socket Disconnected")
    }
}