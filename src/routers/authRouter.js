import express from "express"
import { login, me, register } from "../controllers/UserController.js"
import { verifytoken } from "../middelwars/authmiddelware.js"

const router = express.Router()

router.post("/register" , register)

router.post("/login" , login)

router.get("/me", verifytoken, me)

export default router;