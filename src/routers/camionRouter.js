import express from "express"
import { addCamion, deletCamion, getAllCamions} from "../controllers/CamionController.js"


const router = express.Router()

router.post("/addcamion/" , addCamion)
router.delete("/deletcamion/:id" , deletCamion)
router.get("/getcamions", getAllCamions)

export default router;