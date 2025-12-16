import Camion from "../models/comion.js";
import Remorque from "../models/Remorque.js";
import Pneu from "../models/Pneu.js";
import User from "../models/User.js";
import Trajet from "../models/Trajet.js";

export const getDashboardStats = async (req, res) => {
    const [
        totalCamions,
        totalRemorques,
        totalPneus,
        totalChauffeurs,
        totalTrajets,
        remorquesAttached,
        pneusNeedingMaintenance,
        trajetsEnCours,
        trajetsPlanifies,
        trajetsTermines,
        camionsDisponibles,
        camionsEnUtilisation
    ] = await Promise.all([
        Camion.countDocuments(),
        Remorque.countDocuments(),
        Pneu.countDocuments(),
        User.countDocuments({ role: "Chauffeur" }),
        Trajet.countDocuments(),
        Remorque.countDocuments({ camionAttache: { $ne: null } }),
        Pneu.countDocuments({ $or: [{ usure: { $gte: 80 } }, { etat: "À remplacer" }] }),
        Trajet.countDocuments({ statut: "En cours" }),
        Trajet.countDocuments({ statut: "Planifie" }),
        Trajet.countDocuments({ statut: "Termine" }),
        Camion.countDocuments({ disponible: true }),
        Camion.countDocuments({ disponible: false })
    ]);

    // Get top chauffeurs by number of trips
    const topChauffeurs = await User.aggregate([
        { $match: { role: "Chauffeur" } },
        {
            $lookup: {
                from: "trajets",
                localField: "_id",
                foreignField: "chauffeur",
                as: "trajets"
            }
        },
        {
            $addFields: {
                nombreTrajets: { $size: "$trajets" }
            }
        },
        {
            $project: {
                username: 1,
                email: 1,
                nombreTrajets: 1
            }
        },
        { $sort: { nombreTrajets: -1 } },
        { $limit: 5 }
    ]);

    res.status(200).json({
        totals: {
            camions: totalCamions,
            remorques: totalRemorques,
            pneus: totalPneus,
            chauffeurs: totalChauffeurs,
            trajets: totalTrajets
        },
        status: {
            camionsDisponibles,
            camionsEnUtilisation,
            remorquesAttached,
            remorquesAvailable: totalRemorques - remorquesAttached,
            pneusNeedingMaintenance,
            trajetsEnCours,
            trajetsPlanifies,
            trajetsTermines
        },
        topChauffeurs
    });
};