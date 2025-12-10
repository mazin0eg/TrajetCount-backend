import express from "express"
import { instance } from "./config/db.js";
import authRouter from "./routers/authRouter.js"
import camionRouter from "./routers/camionRouter.js";
import ErrorsHandler from "./middelwars/errorsMiddleware.js";
import cors from "cors"
;

const app = express()
app.use(express.json());

instance.on("connected", () => {
    console.log("MongoDB connected");
});

app.use(cors({
    origin: "*",
    methods: ['GET', 'POST', 'OPTIONS', 'DELETE', 'PUT']
}))

app.use("/api/auth", authRouter)
app.use("/api/camion", camionRouter)


app.use(ErrorsHandler)

export default app;

