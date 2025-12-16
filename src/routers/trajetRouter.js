import express from "express";
import { verifytoken } from "../middelwars/authmiddelware.js";
import { adminOnly } from "../middelwars/adminMiddleware.js";
import { 
    createTrajet, 
    getAllTrajets, 
    getTrajetById, 
    updateTrajet, 
    deleteTrajet, 
    startTrajet, 
    completeTrajet, 
    assignTrajetToChauffeur 
} from "../controllers/TrajetController.js";

const router = express.Router();

router.use(verifytoken);

router.get("/", getAllTrajets);
router.get("/:id", getTrajetById);
router.patch("/:id/start", startTrajet);
router.patch("/:id/complete", completeTrajet);

router.use(adminOnly);

router.post("/", createTrajet);
router.put("/:id", updateTrajet);
router.delete("/:id", deleteTrajet);
router.post("/assign", assignTrajetToChauffeur);

export default router;