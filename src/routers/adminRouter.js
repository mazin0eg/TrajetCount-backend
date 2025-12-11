import express from "express";
import { verifytoken } from "../middelwars/authmiddelware.js";
import { adminOnly } from "../middelwars/adminMiddleware.js";
import { getDashboardStats } from "../controllers/AdminController.js";

const router = express.Router();

router.use(verifytoken);
router.use(adminOnly);

router.get("/dashboard", getDashboardStats);

export default router;