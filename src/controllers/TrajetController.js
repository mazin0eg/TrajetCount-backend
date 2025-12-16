import HttpError from "../config/HttpError.js";
import Trajet from "../models/Trajet.js";
import User from "../models/User.js";
import Camion from "../models/comion.js";
import Remorque from "../models/Remorque.js";

export const createTrajet = async (req, res) => {
    const { 
        nom, 
        pointDepart, 
        pointArrivee, 
        distance, 
        dureeEstimee, 
        chauffeur, 
        camion, 
        remorque, 
        dateDepart,
        notes 
    } = req.body;

    const chauffeurDoc = await User.findById(chauffeur);
    if (!chauffeurDoc || chauffeurDoc.role !== 'Chauffeur') {
        throw new HttpError("Chauffeur not found or invalid role", 404);
    }

    const camionDoc = await Camion.findById(camion);
    if (!camionDoc) {
        throw new HttpError("Camion not found", 404);
    }

    if (!camionDoc.disponible) {
        throw new HttpError("Camion is not available", 400);
    }

    let remorqueDoc = null;
    if (remorque) {
        remorqueDoc = await Remorque.findById(remorque);
        if (!remorqueDoc) {
            throw new HttpError("Remorque not found", 404);
        }
    }

    const existingTrajet = await Trajet.findOne({
        chauffeur: chauffeur,
        statut: { $in: ["Planifie", "En cours"] },
        dateDepart: { $lte: new Date(dateDepart) }
    });

    if (existingTrajet) {
        throw new HttpError("Chauffeur already has an active or planned trip", 400);
    }

    const newTrajet = new Trajet({
        nom,
        pointDepart,
        pointArrivee,
        distance,
        dureeEstimee,
        chauffeur: chauffeur,
        camion: camion,
        remorque: remorque,
        dateDepart: new Date(dateDepart),
        notes
    });

    const savedTrajet = await newTrajet.save();
    
    await Camion.findByIdAndUpdate(camion, { disponible: false });
    
    await savedTrajet.populate(['chauffeur', 'camion', 'remorque']);

    res.status(201).json({ message: "Trajet created successfully", trajet: savedTrajet });
};

export const getAllTrajets = async (req, res) => {
    const { statut, chauffeur } = req.query;
    
    const filter = {};
    if (statut) filter.statut = statut;
    if (chauffeur) filter.chauffeur = chauffeur;
    
    if (req.user.role === "Chauffeur") {
        filter.chauffeur = req.user.userId;
    }

    const trajets = await Trajet.find(filter)
        .populate('chauffeur', 'username email')
        .populate({
            path: 'camion',
            select: 'marque immatriculation kilometrage disponible',
            populate: {
                path: 'remorqueAttachee',
                select: 'marque numeroSerie capaciteCharge etat'
            }
        })
        .populate('remorque', 'marque numeroSerie')
        .sort({ dateDepart: -1 });

    res.status(200).json(trajets);
};

export const getTrajetById = async (req, res) => {
    const { id } = req.params;
    
    const trajet = await Trajet.findById(id)
        .populate('chauffeur', 'username email')
        .populate({
            path: 'camion',
            select: 'marque immatriculation kilometrage disponible',
            populate: {
                path: 'remorqueAttachee',
                select: 'marque numeroSerie capaciteCharge etat'
            }
        })
        .populate('remorque', 'marque numeroSerie');

    if (!trajet) {
        throw new HttpError("Trajet not found", 404);
    }

    if (req.user.role === "Chauffeur" && trajet.chauffeur._id.toString() !== req.user.userId) {
        throw new HttpError("You can only view your own trips", 403);
    }

    res.status(200).json(trajet);
};

export const updateTrajet = async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    if (updates.chauffeur) {
        const chauffeurDoc = await User.findById(updates.chauffeur);
        if (!chauffeurDoc || chauffeurDoc.role !== 'Chauffeur') {
            throw new HttpError("Invalid chauffeur", 400);
        }
    }

    if (updates.camion) {
        const camionDoc = await Camion.findById(updates.camion);
        if (!camionDoc) {
            throw new HttpError("Camion not found", 404);
        }
    }

    if (updates.remorque) {
        const remorqueDoc = await Remorque.findById(updates.remorque);
        if (!remorqueDoc) {
            throw new HttpError("Remorque not found", 404);
        }
    }

    const updatedTrajet = await Trajet.findByIdAndUpdate(id, updates, { new: true })
        .populate(['chauffeur', 'camion', 'remorque']);

    if (!updatedTrajet) {
        throw new HttpError("Trajet not found", 404);
    }

    res.status(200).json({ message: "Trajet updated successfully", trajet: updatedTrajet });
};

export const deleteTrajet = async (req, res) => {
    const { id } = req.params;
    
    const trajet = await Trajet.findById(id);
    if (!trajet) {
        throw new HttpError("Trajet not found", 404);
    }

    if (trajet.statut === "En cours") {
        throw new HttpError("Cannot delete a trip in progress", 400);
    }

    await Camion.findByIdAndUpdate(trajet.camion, { disponible: true });
    await Trajet.findByIdAndDelete(id);
    res.status(200).json({ message: "Trajet deleted successfully" });
};

export const startTrajet = async (req, res) => {
    const { id } = req.params;
    const { kilometrageDepart } = req.body;

    const trajet = await Trajet.findById(id);
    if (!trajet) {
        throw new HttpError("Trajet not found", 404);
    }

    if (req.user.role !== "admin" && trajet.chauffeur.toString() !== req.user.userId) {
        throw new HttpError("You can only update your own trips", 403);
    }

    if (trajet.statut !== "Planifie") {
        throw new HttpError("Trajet cannot be started", 400);
    }

    trajet.statut = "En cours";
    trajet.kilometrageDepart = kilometrageDepart;
    await trajet.save();

    res.status(200).json({ message: "Trajet started successfully", trajet });
};

export const completeTrajet = async (req, res) => {
    const { id } = req.params;
    const { kilometrageArrivee } = req.body;

    const trajet = await Trajet.findById(id);
    if (!trajet) {
        throw new HttpError("Trajet not found", 404);
    }

    if (req.user.role !== "admin" && trajet.chauffeur.toString() !== req.user.userId) {
        throw new HttpError("You can only update your own trips", 403);
    }

    if (trajet.statut !== "En cours") {
        throw new HttpError("Trajet is not in progress", 400);
    }

    trajet.statut = "Termine";
    trajet.dateArrivee = new Date();
    trajet.kilometrageArrivee = kilometrageArrivee;

    if (trajet.kilometrageDepart && kilometrageArrivee) {
        const kmParcourus = kilometrageArrivee - trajet.kilometrageDepart;
        await Camion.findByIdAndUpdate(trajet.camion, {
            $inc: { kilometrage: kmParcourus },
            disponible: true
        });
    } else {
        await Camion.findByIdAndUpdate(trajet.camion, { disponible: true });
    }

    await trajet.save();

    res.status(200).json({ message: "Trajet completed successfully", trajet });
};

export const assignTrajetToChauffeur = async (req, res) => {
    const { trajetId, chauffeur } = req.body;

    const trajet = await Trajet.findById(trajetId);
    if (!trajet) {
        throw new HttpError("Trajet not found", 404);
    }

    if (trajet.statut !== "Planifie") {
        throw new HttpError("Cannot reassign a trip that is not planned", 400);
    }

    const chauffeurDoc = await User.findById(chauffeur);
    if (!chauffeurDoc || chauffeurDoc.role !== 'Chauffeur') {
        throw new HttpError("Invalid chauffeur", 400);
    }

    const existingTrajet = await Trajet.findOne({
        chauffeur: chauffeur,
        statut: { $in: ["Planifie", "En cours"] }
    });

    if (existingTrajet) {
        throw new HttpError("Chauffeur already has an active trip", 400);
    }

    trajet.chauffeur = chauffeur;
    await trajet.save();
    await trajet.populate('chauffeur', 'username email');

    res.status(200).json({ message: "Trajet reassigned successfully", trajet });
};