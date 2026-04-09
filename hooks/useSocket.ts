import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function useSocket(userId: string | null) {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!userId) return;

    // Create socket only once across the app
    if (!socket) {
      socket = io(process.env.NEXT_PUBLIC_APP_URL ?? "", {
        path: "/api/socket",
        auth: { userId },
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });
    }

    function onConnect() {
      setIsConnected(true);
      socket!.emit("chat:join-rooms");
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    if (socket.connected) {
      setIsConnected(true);
    } else {
      socket.connect();
    }

    return () => {
      socket?.off("connect", onConnect);
      socket?.off("disconnect", onDisconnect);
    };
  }, [userId]);

  return { socket, isConnected };
}

export function getSocket() {
  return socket;
}
