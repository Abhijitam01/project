import { prismaClient } from "@repo/db/client";
import express from "express"
import {RegisterSchema, LoginSchema, CreateRoomSchema} from "@repo/common/types"
import brcypt from "bcryptjs"
import jwt from "jsonwebtoken"
import 'dotenv/config'
import cors from "cors"
import { middleware } from "./middleware";
import { randomBytes } from "crypto"

const app = express()

app.use(express.json())
app.use(cors())

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
        res.status(500).json({ error: "Internal Server Error" })
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

        const existingRoom = await prismaClient.room.findFirst({
            where: {
                roomName
            }
        })

        if(existingRoom){
            res.status(409).json({
                error: "Room already exists!"
            })
            return;
        }



        const room = await prismaClient.room.create({
            data: {
                roomName,
                userId,
                isPrivate: Boolean(isPrivate),
                inviteCode
            }
        })

        res.status(201).json({
            room
        })
    } catch (e) {
        res.status(500).json({ error: "Internal Server Error" })
    }
})

app.get("/room/:roomName", async (req, res)=> {
    try {
        const roomName = req.params.roomName

        const room = await prismaClient.room.findFirst({
            where:{
                roomName
            },
            include: {
                shape: true
            }
        })

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
        res.status(500).json({ error: "Internal Server Error" })
    }

})

app.get("/user", middleware , async (req, res)=>{
    try {
        const userId = req.userId

        const user = await prismaClient.user.findUnique({
            where:{
                id: userId
            },
            select:{
                username: true,
                id: true,
                email: true,
                room: true,
                shapes: true
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
        res.status(500).json({ error: "Internal Server Error" })
    }
})




app.listen(3001, ()=>{
    console.log("Listening")
})
