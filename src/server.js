import express from "express";
import "dotenv/config"
import mongoose from "mongoose"
import { instance } from "./config/db.js";
import { register } from "./controllers/UserController.js";

const server = express()
const PORT = process.env.PORT

server.use(express.json());

instance.on("connected", () => {
    console.log("MongoDB connected");
});

server.post("/register" , register)

server.listen(PORT , ()=>{
    console.log(`server runing on ${PORT}`)
})