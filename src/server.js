import express from "express";
import "dotenv/config"
import mongoose from "mongoose"
import { instance } from "./config/db.js";

const server = express()
const PORT = process.env.PORT

instance.on("connected", () => {
    console.log("MongoDB connected");
});

server.listen(PORT , ()=>{
    console.log(`server runing on ${PORT}`)
})