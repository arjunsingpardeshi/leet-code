import {db} from "../libs/db.js"

import jwt from "jsonwebtoken"



const authMiddleware = async (req, res, next) => {

    try {
        const token = req.cookies.jwt;

        if(!token){
            return res.status(400).json({
                message: "unauthorized - no token provided"
            })
        }

        let decoded;
        decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await db.User.findUnique({
            where: {
                id : decoded.id
            },
            select : {
                id : true,
                image : true,
                name : true,
                email : true,
                role : true
            }
        });

        
        if(!user){
            return res.status(404).json({
                
                message : "user not found"

            })
        }
        req.user = user;
        next();

    } catch (error) {
        console.error("error authenticating user", error);
        res.status(500).json({
            message : "error authenticatin user"
        })
    }
}
export {authMiddleware}