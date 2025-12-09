import jwt from "jsonwebtoken"
import HttpError from "../config/HttpError.js"


export const verifytoken  = (req , res , next )=>{
    const authHeather =  req.headers['authorization']
    if(!authHeather){
        throw new HttpError(" ther is no token", 403)
    }
     const token = authHeather.split(' ')[1]
     if(!token){
        throw new HttpError(" Its not a valid token", 403)
    }

    jwt.verify(token , process.env.ACCESS_TOKEN , (err , decoded)=>{
        if(err){
            throw new HttpError("feaold to authentificat token" , 401)
        }
        req.user= decoded
        next()
    })
}