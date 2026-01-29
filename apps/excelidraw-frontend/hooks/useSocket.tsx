"use client";
import { useEffect, useState } from "react";

export const useSocket = (roomId: string | null) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    if (!roomId) return; // Do nothing if roomId is null

    const token = localStorage.getItem("token");
    if (!token) {
      console.error("Token is missing from localStorage");
      return;
    }

    const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL}?token=${token}`);

    ws.onopen = () => {
      setSocket(ws);
      const data = JSON.stringify({
        type: "join_room",
        roomId: roomId,
      });
      ws.send(data);
    };

    ws.onmessage = (event) => {
      // Handle incoming WebSocket messages
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onclose = () => {
      // WebSocket connection closed
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [roomId]); // Dependency array includes roomId

  return socket;
};
