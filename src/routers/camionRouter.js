import express from "express"
import { addCamion} from "../controllers/CamionController.js"


const router = express.Router()

router.post("/addCamion" , addCamion)

export default router;