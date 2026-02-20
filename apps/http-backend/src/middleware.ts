import {Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken"
import "dotenv/config"

declare global{
    namespace Express{
        interface Request{
            userId?: string
            requestId?: string
        }
    }
}

export const middleware = (req: Request, res: Response , next : NextFunction) => {
    const token = extractAuthToken(req.headers["authorization"])

    if (!process.env.JWT_SECRET) {
        res.status(500).json({ message: "Server misconfigured" })
        return;
    }

    try {
        const userId = verifyAuthToken(token)
        if (typeof userId === "string") {
            req.userId = userId
            next()
        } else {
             res.status(401).json({
                message: "Unauthorized!"
            })
        }
    } catch(e) {
        res.status(401).json({
            message: "Unauthorized!"
        })
    }

}

export const extractAuthToken = (authorizationHeader: string | string[] | undefined): string => {
    const value = Array.isArray(authorizationHeader) ? authorizationHeader[0] : authorizationHeader
    if (!value || typeof value !== "string") return ""
    const trimmed = value.trim()
    if (!trimmed) return ""
    if (trimmed.toLowerCase().startsWith("bearer ")) {
        return trimmed.slice(7).trim()
    }
    return trimmed
}

export const verifyAuthToken = (token: string): string | null => {
    if (!token || !process.env.JWT_SECRET) {
        return null
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        if (typeof decoded === "object" && decoded !== null && typeof decoded.userId === "string") {
            return decoded.userId
        }
        return null
    } catch {
        return null
    }
}
