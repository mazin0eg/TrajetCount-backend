import express from "express"
import { addCamion, deletCamion} from "../controllers/CamionController.js"


const router = express.Router()

router.post("/" , addCamion)
router.delete("/:id" , deletCamion)

export default router;