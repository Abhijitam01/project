import { prismaClient } from "@repo/db/client";
import express from "express"
import {RegisterSchema, LoginSchema, CreateRoomSchema} from "@repo/common/types"
import { createLogger } from "@repo/common/logger"
import brcypt from "bcryptjs"
import jwt from "jsonwebtoken"
import 'dotenv/config'
import cors from "cors"
import { middleware } from "./middleware";
import { randomBytes, randomUUID } from "crypto"

const app = express()
const logger = createLogger({ service: "http-backend" })
const port = Number(process.env.HTTP_PORT ?? 3001)

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

app.use(express.json())
app.use(cors())
app.use((req, res, next) => {
    const incomingRequestId = req.header("x-request-id")
    const requestId = incomingRequestId && incomingRequestId.trim() ? incomingRequestId : randomUUID()
    const startedAt = Date.now()

    req.requestId = requestId
    res.setHeader("x-request-id", requestId)

    res.on("finish", () => {
        logger.info("HTTP request completed", {
            requestId,
            method: req.method,
            path: req.originalUrl,
            statusCode: res.statusCode,
            durationMs: Date.now() - startedAt
        })
    })

    next()
})

if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is required")
}


app.post("/signup", async (req, res)=> {
    const validatedFields = RegisterSchema.safeParse(req.body)

    if(!validatedFields.success){
        res.status(400).json({
            error: "Invalid Fields"
        })
        return;
    }

    try {
        const {username, email, password} = validatedFields.data

        const hashedPassword = await brcypt.hash(password , 10)

        const existingUser = await prismaClient.user.findUnique({
            where:{
                email
            }
        })

        if(existingUser){
            res.status(409).json({
                error: "User Already Exists!"
            })
            return;
        }

        const user = await prismaClient.user.create({
            data: {
                username,
                email,
                password: hashedPassword
            }
        })


        res.status(201).json({
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        })
    } catch (e) {
        logger.error("Signup failed", { requestId: req.requestId, error: e })
        res.status(500).json({ error: "Internal Server Error" })
    }
})

app.post("/signin", async (req,res)=> {
    const validatedFields = LoginSchema.safeParse(req.body)

    if(!validatedFields || !validatedFields.success || !validatedFields.data.password){
        res.status(400).json({
            error: "Invalid Fields!"
        })
        return;
    }

    try {
        const {email, password} = validatedFields.data

        const user  = await prismaClient.user.findUnique({
            where:{
                email
            }
        })

        if(!user){
            res.status(404).json({
                error: "User does not exist!"
            })
            return;
        }

        const matchPassword  = await brcypt.compare(password , user.password)

        if(!matchPassword){
            res.status(401).json({
                error: "Invalid Credentials!"
            })
            return;
        }

        const token = jwt.sign({userId : user.id} , process.env.JWT_SECRET!)

        res.json({
            token
        })
    } catch (e) {
        logger.error("Signin failed", { requestId: req.requestId, error: e })
        res.status(500).json({ error: "Internal Server Error" })
    }

})

app.post("/signin/demo", async (req, res) => {
    if (process.env.NODE_ENV === "production") {
        res.status(404).json({ error: "Not found" })
        return;
    }

    try {
        const demoEmail = "demo@drawr.local"
        const demoUsername = "Demo User"
        const demoPassword = process.env.DEMO_PASSWORD || "demo12345"

        let user = await prismaClient.user.findUnique({
            where: { email: demoEmail }
        })

        if (!user) {
            const hashedPassword = await brcypt.hash(demoPassword, 10)
            user = await prismaClient.user.create({
                data: {
                    username: demoUsername,
                    email: demoEmail,
                    password: hashedPassword,
                }
            })
        }

        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!)
        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
            }
        })
    } catch (e) {
        logger.error("Demo signin failed", { requestId: req.requestId, error: e })
        res.status(500).json({ error: "Unable to sign in with demo account" })
    }
})


app.post("/room", middleware , async (req, res)=> {
    const validRoom = CreateRoomSchema.safeParse(req.body)

    if(!validRoom.success){
        res.status(400).json({
            error: "Invalid Room Name"
        })
        return;
    }

    try {
        const userId = req.userId

        if(!userId){
            res.status(401).json({
                error: "User doesn't exist!"
            })
            return;
        }


        const { roomName, isPrivate } = validRoom.data

        const inviteCode = isPrivate ? randomBytes(4).toString("hex") : null

        let existingRoom: { id: number } | null = null
        try {
            existingRoom = await prismaClient.room.findFirst({
                where: {
                    roomName
                },
                select: {
                    id: true
                }
            })
        } catch (roomLookupError: unknown) {
            if (!isLegacyRoomSchemaError(roomLookupError)) {
                throw roomLookupError
            }
            const existingLegacyRoom = await prismaClient.$queryRaw<Array<{ id: number }>>`
                SELECT "id" FROM "Room" WHERE "roomName" = ${roomName} LIMIT 1
            `
            existingRoom = existingLegacyRoom[0] ?? null
        }

        if(existingRoom){
            res.status(409).json({
                error: "Room already exists!"
            })
            return;
        }



        let room: {
            id: number
            roomName: string
            userId: string
            isPrivate?: boolean
            inviteCode?: string | null
        }
        try {
            room = await prismaClient.room.create({
                data: {
                    roomName,
                    userId,
                    isPrivate: Boolean(isPrivate),
                    inviteCode
                }
            })
        } catch (createError: unknown) {
            if (!isLegacyRoomSchemaError(createError)) {
                throw createError
            }

            logger.warn("Falling back to legacy room schema without private fields", {
                requestId: req.requestId,
                userId,
                roomName,
            })

            const createdLegacyRoom = await prismaClient.$queryRaw<Array<{ id: number; roomName: string; userId: string }>>`
                INSERT INTO "Room" ("roomName", "userId")
                VALUES (${roomName}, ${userId})
                RETURNING "id", "roomName", "userId"
            `
            const row = createdLegacyRoom[0]
            if (!row) {
                throw new Error("Failed to create room in legacy schema fallback")
            }
            room = {
                ...row,
                isPrivate: false,
                inviteCode: null
            }
        }

        res.status(201).json({
            room
        })
    } catch (e) {
        logger.error("Room creation failed", { requestId: req.requestId, error: e, userId: req.userId })
        res.status(500).json({ error: "Internal Server Error" })
    }
})

app.get("/room/:roomName", async (req, res)=> {
    try {
        const roomName = req.params.roomName

        let room: ({
            id: number
            roomName: string
            userId: string
            isPrivate?: boolean
            inviteCode?: string | null
        } & { shape: Array<{ data: string; id: number; userId: string; roomId: number }> }) | null = null

        try {
            const typedRoom = await prismaClient.room.findFirst({
                where:{
                    roomName
                },
                include: {
                    shape: true
                }
            })
            room = typedRoom
        } catch (roomFetchError: unknown) {
            if (!isLegacyRoomSchemaError(roomFetchError)) {
                throw roomFetchError
            }

            const legacyRoomRows = await prismaClient.$queryRaw<Array<{ id: number; roomName: string; userId: string }>>`
                SELECT "id", "roomName", "userId" FROM "Room" WHERE "roomName" = ${roomName} LIMIT 1
            `
            const legacyRoom = legacyRoomRows[0]
            if (!legacyRoom) {
                room = null
            } else {
                const shapes = await prismaClient.shape.findMany({
                    where: { roomId: legacyRoom.id }
                })
                room = {
                    ...legacyRoom,
                    isPrivate: false,
                    inviteCode: null,
                    shape: shapes
                }
            }
        }

        if(!room){
            res.status(404).json({
                error: "Room not found"
            })
            return;
        }

        const invite = typeof req.query.invite === "string" ? req.query.invite : undefined
        const payloadRoom = {
            ...room,
            inviteCode: room.isPrivate && room.inviteCode === invite ? room.inviteCode : undefined
        }

        res.json({ room: payloadRoom })
    } catch (e) {
        logger.error("Room fetch failed", { requestId: req.requestId, error: e })
        res.status(500).json({ error: "Internal Server Error" })
    }

})

app.get("/user", middleware , async (req, res)=>{
    try {
        const userId = req.userId
        if (!userId) {
            res.status(401).json({ error: "Unauthorized!" })
            return;
        }

        const user = await prismaClient.user.findUnique({
            where:{
                id: userId
            },
            select:{
                username: true,
                id: true,
                email: true,
                room: {
                    select: {
                        id: true,
                        roomName: true
                    }
                }
            }
        })

        if(!user){
            res.status(404).json({
                error: "User not found"
            })
            return;
        }

        res.json({ user })
    } catch (e) {
        logger.error("User fetch failed", { requestId: req.requestId, error: e, userId: req.userId })
        res.status(500).json({ error: "Internal Server Error" })
    }
})




app.listen(port, ()=>{
    logger.info("HTTP server listening", { port, env: process.env.NODE_ENV ?? "development" })
})

process.on("unhandledRejection", (reason) => {
    logger.error("Unhandled promise rejection", reason)
})

process.on("uncaughtException", (error) => {
    logger.error("Uncaught exception", error)
    process.exit(1)
})
