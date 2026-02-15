import jwt from "jsonwebtoken"
import "dotenv/config"

export const  checkUser = (token: string) : string | null => {

    if (!process.env.JWT_SECRET) {
        return null
    }

    try {
        const decoded = jwt.verify(token , process.env.JWT_SECRET) as {userId :string}
        if(decoded){
            return decoded.userId
        }
    } catch (e) {
        return null
    }

    return null
}
