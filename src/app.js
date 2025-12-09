import express from "express"
import { instance } from "./config/db.js";
import authRouter from "./routers/authRouter.js"
import ErrorsHandler from "./middelwars/errorsMiddleware.js";

const app = express()
app.use(express.json());

instance.on("connected", () => {
    console.log("MongoDB connected");
});

app.use("/api/auth", authRouter)


app.use(ErrorsHandler)

export default app;

