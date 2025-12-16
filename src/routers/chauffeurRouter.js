import express from "express";
import { verifytoken } from "../middelwars/authmiddelware.js";
import { chauffeurOnly } from "../middelwars/chauffeurMiddleware.js";
import { 
    getMesTrajets,
    getMonTrajet,
    getMesPneus,
    updatePneuStatus,
    generateTrajetPDF
} from "../controllers/ChauffeurController.js";

const router = express.Router();

router.use(verifytoken);
router.use(chauffeurOnly);

// Trip routes
router.get("/trajets", getMesTrajets);
router.get("/trajets/:id", getMonTrajet);
router.get("/trajets/:id/pdf", generateTrajetPDF);

// Tire management routes
router.get("/pneus", getMesPneus);
router.put("/pneus/:id", updatePneuStatus);

export default router;