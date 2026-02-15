import jwt from "jsonwebtoken"
import "dotenv/config"

export const  checkUser = (token: string) : string | null => {

    if (!process.env.JWT_SECRET) {
        return null
    }

    try {
        const decoded = jwt.verify(token , process.env.JWT_SECRET)
        if (typeof decoded === "object" && decoded !== null && typeof decoded.userId === "string") {
            return decoded.userId
        }
    } catch (e) {
        return null
    }

    return null
}
