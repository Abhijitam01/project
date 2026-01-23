import { WebSocketServer, WebSocket } from "ws";
import jwt, { JwtPayload } from "jsonwebtoken";

const wss = new WebSocketServer({ port: 8080 });
console.log("WebSocket server started on ws://localhost:8080");

wss.on("connection", (ws: WebSocket, req) => {
  try {
    const url = new URL(req.url || '', 'http://localhost:8080');
    const token = url.searchParams.get('token');

    if (!token) {
      ws.close(4001, 'No token provided');
      return;
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key') as JwtPayload;

    if (!decoded || !decoded.userId) {
      ws.close(4002, 'Invalid token');
      return;
    }
    (ws as any).userId = decoded.userId as string;
    console.log(`User ${(ws as any).userId} connected`);
    ws.on("message", (message: Buffer) => 
      ws.send(`Echo: ${message}`   
      ));
    ws.on("close", () => console.log(`User ${(ws as any).userId} disconnected`));

  } catch (error) {
    console.error('WebSocket authentication error:', error);
    ws.close(4003, 'Authentication failed');
  }
});  