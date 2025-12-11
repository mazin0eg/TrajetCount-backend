import Camion from "../models/comion.js";
import Remorque from "../models/Remorque.js";
import Pneu from "../models/Pneu.js";
import User from "../models/User.js";

export const getDashboardStats = async (req, res) => {
    const [
        totalCamions,
        totalRemorques,
        totalPneus,
        totalChauffeurs,
        camionsWithChauffeur,
        remorquesAttached,
        pneusNeedingMaintenance
    ] = await Promise.all([
        Camion.countDocuments(),
        Remorque.countDocuments(),
        Pneu.countDocuments(),
        User.countDocuments({ role: "Chauffeur" }),
        Camion.countDocuments({ currentChauffeur: { $ne: null } }),
        Remorque.countDocuments({ camionAttache: { $ne: null } }),
        Pneu.countDocuments({ $or: [{ usure: { $gte: 80 } }, { etat: "À remplacer" }] })
    ]);

    res.status(200).json({
        totals: {
            camions: totalCamions,
            remorques: totalRemorques,
            pneus: totalPneus,
            chauffeurs: totalChauffeurs
        },
        status: {
            camionsWithChauffeur,
            camionsAvailable: totalCamions - camionsWithChauffeur,
            remorquesAttached,
            remorquesAvailable: totalRemorques - remorquesAttached,
            pneusNeedingMaintenance
        }
    });
};