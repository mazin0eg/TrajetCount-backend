import express from "express"
import { instance } from "./config/db.js";
import authRouter from "./routers/authRouter.js"

const app = express()
app.use(express.json());

instance.on("connected", () => {
    console.log("MongoDB connected");
});

app.use("/api/auth", authRouter)


app.use((err, req, res, next) => {
    if(err instanceof HttpError)
        res.status(err.statusCode).json({message: err.message});
    else{
        res.status(500).json({message: err.message});
    }
})

export default app;

