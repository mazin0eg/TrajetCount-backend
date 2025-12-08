import mongoose from "mongoose";
import "dotenv/config"

export const instance = mongoose.createConnection(`${process.env.MONGO_PATH}`, {
    auth:{
        username: "test",
        password: "test"
    },
     authSource: "admin"
})
