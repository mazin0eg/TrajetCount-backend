import express from "express";
import { verifytoken } from "../middelwars/authmiddelware.js";
import { adminOnly } from "../middelwars/adminMiddleware.js";
import { 
    addRemorque, 
    getAllRemorques,
    getAvailableRemorques, 
    updateRemorque, 
    deleteRemorque, 
    attachRemorqueToCamion, 
    detachRemorqueFromCamion 
} from "../controllers/RemorqueController.js";

const router = express.Router();

router.use(verifytoken);
router.use(adminOnly);

router.post("/", addRemorque);
router.get("/", getAllRemorques);
router.get("/available", getAvailableRemorques);
router.put("/:id", updateRemorque);
router.delete("/:id", deleteRemorque);
router.post("/attach", attachRemorqueToCamion);
router.delete("/:remorqueId/detach", detachRemorqueFromCamion);

export default router;