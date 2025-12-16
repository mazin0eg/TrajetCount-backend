import express from "express"
import { instance } from "./config/db.js";
import authRouter from "./routers/authRouter.js"
import camionRouter from "./routers/camionRouter.js";
import remorqueRouter from "./routers/remorqueRouter.js";
import pneuRouter from "./routers/pneuRouter.js";
import trajetRouter from "./routers/trajetRouter.js";
import chauffeurRouter from "./routers/chauffeurRouter.js";
import adminRouter from "./routers/adminRouter.js";
import ErrorsHandler from "./middelwars/errorsMiddleware.js";
import cors from "cors";

const app = express()
app.use(express.json());

instance.on("connected", () => {
    console.log("MongoDB connected");
});

app.use(cors({
    origin: "*",
    methods: ['GET', 'POST', 'OPTIONS', 'DELETE', 'PUT', 'PATCH']
}))

app.use("/api/auth", authRouter)
app.use("/api/camions", camionRouter)
app.use("/api/remorques", remorqueRouter)
app.use("/api/pneus", pneuRouter)
app.use("/api/trajets", trajetRouter)
app.use("/api/chauffeur", chauffeurRouter)
app.use("/api/admin", adminRouter)


app.use(ErrorsHandler)  

export default app;

