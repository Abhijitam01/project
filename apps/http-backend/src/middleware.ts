import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

export function middleware(req : Request , res : Response , next : NextFunction) {
    const token = req.headers.authorization?.split(' ')[1];
    const decoded = jwt.verify(token || '' , process.env.JWT_SECRET || 'fallback-secret-key');
    if( !decoded ){
        return
        res.status(401).json({
            error: 'Unauthorized'
        });
    }
    req.userId = (decoded as JwtPayload).userId;
    next();
}