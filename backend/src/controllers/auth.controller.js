import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import {db} from "../libs/db.js"
import { UserRole } from "../generated/prisma/index.js";

const register = async (req, res) => {
    const {email, password, name} = req.body;
    try {
        const existingUser = await db.User.findUnique({
            where:{
                email
            }
        });

        if(existingUser){
            
            return res.status(400).json({
                error: "User already exist"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const newUser = await db.User.create({
            data:{
                email,
                password:hashedPassword,
                name,
                role:UserRole.USER
            }
        });
        const token = jwt.sign({id:newUser.id}, process.env.JWT_SECRET, {expiresIn: "7d"});
        res.cookie("jwt",token,{
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV != "devlopment",
            maxAge: 1000*60*60*24*7                         //7days
        });
        res.status(201).json({
            success: true,
            message: "User created successfully",
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
            image: newUser.image
        });
    } catch (error) {
        console.error("error creating user", error);
        res.status(500).json({
            
            error: "error creating user"
        })
    }
}

const login = async (req, res) => {

    const {email, password} = req.body    
    try {
        
        const user = await db.User.findUnique({
                where: {
                    email
                }
        })
        if (!user) {
            return res.status(401).json({
                error: "User not found"
            })
            
        }
       //  console.log("password = ",password);
       //  console.log("user.password = ",user.password);
       //  console.log("user = ",user);
        
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            return res.status(401).json({
                error: "Invalid credential"
            })
        }

        const token = jwt.sign({id: user.id}, process.env.JWT_SECRET,{expiresIn: "7d"});

        res.cookie("jwt",token,{
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV != "devlopment",
            maxAge: 1000*60*60*24*7                         //7days
        });
        res.status(200).json({
            success: true,
            message: "Logged in successfully",
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            image: user.image
        });
    } catch (error) {
        console.log("error in logged in ", error);
        res.status(500).json({
            error: "error in loggedIn"
        })
    }
}

const logout = async (req, res) => {
    try {
        res.clearCookie("jwt", {
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV !== "development"
        });
        res.status(200).json({
            success: true,
            message: "user logout successfully"
        })

    } catch (error) {
        console.error("error  loging out user", error);
        res.status(500).json({
            error: "error logging out user "
        })
    }
}

const check = async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            message: "authenticated successfully",
            user : req.user
        });
    } catch (error) {
        
        console.error("error checking user", error);
        res.status(500).json({error: "error cheking user"})
    }
}

export {register, login, logout, check}