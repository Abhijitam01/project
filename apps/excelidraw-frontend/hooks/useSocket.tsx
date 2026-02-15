"use client";
import { useEffect, useState } from "react";

export const useSocket = (roomId: string | null, inviteCode?: string | null) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    if (!roomId) return; // Do nothing if roomId is null

    const token = localStorage.getItem("token");
    if (!token) {
      console.error("Token is missing from localStorage");
      return;
    }

    if (!process.env.NEXT_PUBLIC_WS_URL) {
      console.error("NEXT_PUBLIC_WS_URL is not set");
      return;
    }

    const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL}/?token=${token}`);

    ws.onopen = () => {
      console.log("WebSocket connection opened");
      setSocket(ws);
      const storedInvite = inviteCode ?? localStorage.getItem(`drawr:invite:${roomId}`) ?? "";
      const data = JSON.stringify({
        type: "join_room",
        roomId,
        invite: storedInvite,
      });
      ws.send(data);
    };

    ws.onmessage = (event) => {
      console.log("WebSocket message received:", event.data);
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onclose = () => {
      console.log("WebSocket connection closed");
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(
          JSON.stringify({
            type: "leave_room",
            roomId,
          })
        );
        ws.close();
      }
    };
  }, [roomId, inviteCode]); // Dependency array includes roomId

  return socket;
};
