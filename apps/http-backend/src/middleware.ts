import {Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken"
import "dotenv/config"

declare global{
    namespace Express{
        interface Request{
            userId?: string
        }
    }
}

export const middleware = (req: Request, res: Response , next : NextFunction) => {
    const token = req.headers["authorization"] ?? ""

    if (!process.env.JWT_SECRET) {
        res.status(500).json({ message: "Server misconfigured" })
        return;
    }

    try {
        const decoded = jwt.verify(token , process.env.JWT_SECRET) as {userId: string}
        if(decoded){
            req.userId = decoded.userId
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
