import express from "express";
import { verifytoken } from "../middelwars/authmiddelware.js";
import { adminOnly } from "../middelwars/adminMiddleware.js";
import { 
    addPneu, 
    getAllPneus, 
    getPneusByVehicule, 
    updatePneu, 
    deletePneu, 
    getPneusNeedingMaintenance 
} from "../controllers/PneuController.js";

const router = express.Router();

router.use(verifytoken);
router.use(adminOnly);

router.post("/", addPneu);
router.get("/", getAllPneus);
router.get("/maintenance", getPneusNeedingMaintenance);
router.get("/vehicule/:vehiculeType/:vehiculeId", getPneusByVehicule);
router.put("/:id", updatePneu);
router.delete("/:id", deletePneu);

export default router;