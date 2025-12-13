import express from "express";
import { verifytoken } from "../middelwars/authmiddelware.js";
import { adminOnly } from "../middelwars/adminMiddleware.js";
import { addCamion, deletCamion, getAllCamions, getAvailableCamions, updateCamion, getCamionById } from "../controllers/CamionController.js";

const router = express.Router();

router.use(verifytoken);

router.get("/", getAllCamions);
router.get("/available", getAvailableCamions);
router.get("/:id", getCamionById);

router.use(adminOnly);

router.post("/", addCamion);
router.put("/:id", updateCamion);
router.delete("/:id", deletCamion);

export default router;