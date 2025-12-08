import express from "express"
import { instance } from "./config/db.js";
import authRouter from "./routers/authRouter.js"

const app = express()
app.use(express.json());

instance.on("connected", () => {
    console.log("MongoDB connected");
});

app.use("/api/auth", authRouter)

export default app;

