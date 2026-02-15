import {WebSocket, WebSocketServer} from "ws"
import type { RawData } from "ws"
import { checkUser } from "./checkUser";
import {prismaClient} from "@repo/db/client"
import { createLogger } from "@repo/common/logger"
import "dotenv/config"
import { randomUUID } from "crypto"

const logger = createLogger({ service: "ws-backend" })
const port = Number(process.env.WS_PORT ?? 8080)
const wss = new WebSocketServer({port})

interface User {
    ws:  WebSocket,
    rooms: string[],
    userId: string
    username?: string
}

const users : User[] = []
const MAX_MESSAGE_BYTES = 100_000

const isLegacyRoomSchemaError = (error: unknown): boolean => {
    if (!error || typeof error !== "object") {
        return false
    }
    const maybe = error as {
        code?: string
        message?: string
        meta?: { column?: string }
    }
    if (maybe.code !== "P2022") {
        return false
    }
    const column = typeof maybe.meta?.column === "string" ? maybe.meta.column : ""
    const message = typeof maybe.message === "string" ? maybe.message : ""
    return (
        column.includes("Room.isPrivate") ||
        column.includes("Room.inviteCode") ||
        message.includes("Room.isPrivate") ||
        message.includes("Room.inviteCode")
    )
}

const getUser = (ws: WebSocket) => users.find(x => x.ws === ws)
const broadcastPresence = (roomId: string) => {
    const activeUsers = users
        .filter(u => u.rooms.includes(roomId))
        .map(u => ({
            id: u.userId,
            username: u.username || "User"
        }))

    users.forEach(u => {
        if (u.rooms.includes(roomId)) {
            u.ws.send(JSON.stringify({
                type: "presence",
                roomId,
                users: activeUsers
            }))
        }
    })
}

const toText = (data: RawData): string => {
    if (typeof data === "string") {
        return data
    }
    if (Buffer.isBuffer(data)) {
        return data.toString()
    }
    if (Array.isArray(data)) {
        return Buffer.concat(data).toString()
    }
    if (data instanceof ArrayBuffer) {
        return Buffer.from(data).toString()
    }
    return ""
}

const safeJsonParse = (data: RawData | string) => {
    try {
        const text = typeof data === "string" ? data : toText(data)
        return JSON.parse(text)
    } catch (e) {
        return null
    }
}

logger.info("WebSocket server listening", { port, env: process.env.NODE_ENV ?? "development" })

wss.on("connection", async function connection(ws, request){
    const url = request.url

    if(!url){
        return;
    }

    const queryParams = new URLSearchParams(url.split("?")[1])
    const connectionId = queryParams.get("requestId") || randomUUID()
    const token = queryParams.get("token") || ""
    const userId = checkUser(token)

    if (userId === null){
        logger.warn("Rejected websocket connection due to invalid token", { connectionId })
        ws.close()
        return null;
    }


    let username = "User"
    try {
        const dbUser = await prismaClient.user.findUnique({
            where: { id: userId },
            select: { username: true }
        })
        if (dbUser?.username) {
            username = dbUser.username
        }
    } catch (e) {
        logger.warn("User lookup failed during websocket connection", { connectionId, userId, error: e })
    }

    users.push({
        userId,
        username,
        ws,
        rooms: []
    })

    logger.info("WebSocket connection established", { connectionId, userId, username })




    ws.on("error", (error) => {
        logger.error("WebSocket connection error", { connectionId, userId, error })
    })

    ws.on("close", () => {
        const user = getUser(ws)
        const rooms = user?.rooms ? [...user.rooms] : []
        const index = users.findIndex(x => x.ws === ws)
        if (index !== -1) {
            users.splice(index, 1)
        }
        logger.info("WebSocket connection closed", { connectionId, userId, roomCount: rooms.length })
        rooms.forEach(broadcastPresence)
    })



    ws.on('message', async function message(data){
        const text = toText(data)
        const size = Buffer.byteLength(text)
        if (size > MAX_MESSAGE_BYTES) {
            return;
        }
        const parsedData = safeJsonParse(text)
        if (!parsedData || typeof parsedData.type !== "string") {
            return;
        }

        if(parsedData.type === "join_room"){
            const user = getUser(ws)
            const roomId = String(parsedData.roomId ?? "")
            const roomIdNum = Number(roomId)
            if (!user || !roomId || !Number.isFinite(roomIdNum)) {
                return;
            }
            let room: { id: number; roomName: string; userId: string; isPrivate?: boolean; inviteCode?: string | null } | null = null
            try {
                room = await prismaClient.room.findUnique({
                    where: { id: roomIdNum }
                })
            } catch (roomError: unknown) {
                if (!isLegacyRoomSchemaError(roomError)) {
                    throw roomError
                }
                const legacyRooms = await prismaClient.$queryRaw<Array<{ id: number; roomName: string; userId: string }>>`
                    SELECT "id", "roomName", "userId" FROM "Room" WHERE "id" = ${roomIdNum} LIMIT 1
                `
                const legacyRoom = legacyRooms[0]
                room = legacyRoom ? { ...legacyRoom, isPrivate: false, inviteCode: null } : null
            }
            if (!room) {
                return;
            }
            if (room.isPrivate) {
                const invite = String(parsedData.invite ?? "")
                if (!invite || room.inviteCode !== invite) {
                    return;
                }
            }

            if (!user.rooms.includes(roomId)) {
                user.rooms.push(roomId)
            }
            logger.info("WebSocket joined room", { connectionId, userId, roomId })
            broadcastPresence(roomId)
            return;
        }

        if(parsedData.type === "leave_room"){
            const user = getUser(ws)
            const roomId = String(parsedData.roomId ?? "")
            if(!user || !roomId){
                return;
            }
            user.rooms = user.rooms.filter(x => x !== roomId)
            logger.info("WebSocket left room", { connectionId, userId, roomId })
            broadcastPresence(roomId)
            return;
        }

        if(parsedData.type === "reset"){
            const roomId = String(parsedData.roomId ?? "")
            const roomIdNum = Number(roomId)
            if (!roomId || !Number.isFinite(roomIdNum)) {
                return;
            }

            await prismaClient.shape.deleteMany({
                where:{
                    roomId: roomIdNum
                }
            })

            users.forEach(user => {
                if(user.rooms.includes(roomId) && user.ws !== ws){
                    user.ws.send(JSON.stringify({
                        type: "reset",
                        roomId
                    }))
                }
            })
            return;
        }

        if(parsedData.type === "bulk_draw"){
            const roomId = String(parsedData.roomId ?? "")
            const roomIdNum = Number(roomId)
            const shapes = parsedData.shapes
            if (!roomId || !Number.isFinite(roomIdNum) || !Array.isArray(shapes)) {
                return;
            }

            const payloads = shapes
                .filter((shape) => shape && typeof shape === "object")
                .map((shape) => ({
                    roomId: roomIdNum,
                    data: JSON.stringify({ shape }),
                    userId
                }))

            if (payloads.length) {
                await prismaClient.shape.createMany({
                    data: payloads
                })
            }

            users.forEach(user => {
                if(user.rooms.includes(roomId) && user.ws !== ws){
                    user.ws.send(JSON.stringify({
                        type: "bulk_draw",
                        roomId,
                        data: JSON.stringify({ shapes })
                    }))
                }
            })

            return;
        }

        if(parsedData.type === "cursor"){
            const roomId = String(parsedData.roomId ?? "")
            const roomIdNum = Number(roomId)
            const cursorPayload = safeJsonParse(parsedData.data)
            if (!roomId || !Number.isFinite(roomIdNum) || !cursorPayload) {
                return;
            }
            const x = Number(cursorPayload.x)
            const y = Number(cursorPayload.y)
            if (!Number.isFinite(x) || !Number.isFinite(y)) {
                return;
            }
            const sender = getUser(ws)
            const payload = {
                userId,
                username: sender?.username || "User",
                x,
                y
            }

            users.forEach(user => {
                if(user.rooms.includes(roomId) && user.ws !== ws){
                    user.ws.send(JSON.stringify({
                        type: "cursor",
                        roomId,
                        data: JSON.stringify(payload)
                    }))
                }
            })
            return;
        }

        if(parsedData.type === "draw"){
            const roomId = String(parsedData.roomId ?? "")
            const payload = parsedData.data
            const roomIdNum = Number(roomId)
            if (!roomId || typeof payload !== "string" || !Number.isFinite(roomIdNum) || payload.length > MAX_MESSAGE_BYTES) {
                return;
            }

            await prismaClient.shape.create({
                data: {
                    roomId: roomIdNum,
                    data: payload,
                    userId
                }
            })


            users.forEach(user => {
                if(user.rooms.includes(roomId) && user.ws !== ws){
                    user.ws.send(JSON.stringify({
                        type: "draw",
                        data: payload,
                        roomId
                    }))
                }
            })

            return;
        }


        if(parsedData.type === "erase"){
            const roomId = String(parsedData.roomId ?? "")
            const payload = parsedData.data
            const roomIdNum = Number(roomId)
            if (!roomId || typeof payload !== "string" || !Number.isFinite(roomIdNum) || payload.length > MAX_MESSAGE_BYTES) {
                return;
            }

            await prismaClient.shape.deleteMany({
                where:{
                    data: payload,
                    roomId: roomIdNum
                }
            })

            users.forEach(user => {
                if(user.rooms.includes(roomId) && user.ws !== ws){
                    user.ws.send(JSON.stringify({
                        type: "erase",
                        data: payload,
                        roomId
                    }))
                }
            })
            return;
        }

    })
})

process.on("unhandledRejection", (reason) => {
    logger.error("Unhandled promise rejection", reason)
})

process.on("uncaughtException", (error) => {
    logger.error("Uncaught exception", error)
    process.exit(1)
})
