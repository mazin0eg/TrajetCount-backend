import express from "express"
import { login, me, register, getAllChauffeurs, getChauffeurStats } from "../controllers/UserController.js"
import { verifytoken } from "../middelwars/authmiddelware.js"
import { adminOnly } from "../middelwars/adminMiddleware.js"

const router = express.Router()

router.post("/register" , register)
router.post("/login" , login)
router.get("/me", verifytoken, me)

router.get("/chauffeurs", verifytoken, adminOnly, getAllChauffeurs)
router.get("/chauffeurs/:id/stats", verifytoken, adminOnly, getChauffeurStats)

export default router;