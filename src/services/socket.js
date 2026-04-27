import { io } from "socket.io-client";

// เมื่อใช้ Proxy เราจะเชื่อมต่อมาที่ Host ปัจจุบัน (Window Origin)
// โดย Vite จะทำหน้าที่ส่งต่อ (Proxy) ไปยัง Backend ให้เอง
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

    // ไม่ต้องใส่ URL เต็มๆ เพื่อให้มันใช้ Host เดียวกับหน้าเว็บ
    socket = io("/", {
        auth: { token },
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        transports: ["websocket", "polling"] // รองรับทั้งคู่เพื่อความเสถียร
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