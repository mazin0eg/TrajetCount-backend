import HttpError from "../config/HttpError.js";
import Pneu from "../models/Pneu.js";
import Camion from "../models/comion.js";
import Remorque from "../models/Remorque.js";

export const addPneu = async (req, res) => {
    const { marque, taille, pression, usure, etat, vehiculeId, vehiculeType, position } = req.body;

    if (vehiculeId) {
        let vehicule;
        if (vehiculeType === "Camion") {
            vehicule = await Camion.findById(vehiculeId);
        } else if (vehiculeType === "Remorque") {
            vehicule = await Remorque.findById(vehiculeId);
        }
        
        if (!vehicule) {
            throw new HttpError(`${vehiculeType} not found`, 404);
        }
    }

    const newPneu = new Pneu({
        marque,
        taille,
        pression,
        usure: usure || 0,
        etat: etat || "Neuf",
        vehiculeId,
        vehiculeType,
        position
    });

    const savedPneu = await newPneu.save();
    if (savedPneu) {
        res.status(201).json({ message: "Pneu created successfully", pneu: savedPneu });
    } else {
        throw new HttpError("Failed to create pneu");
    }
};

export const getAllPneus = async (req, res) => {
    const pneus = await Pneu.find().populate('vehiculeId');
    res.status(200).json(pneus);
};

export const getPneusByVehicule = async (req, res) => {
    const { vehiculeId, vehiculeType } = req.params;
    const pneus = await Pneu.find({ vehiculeId, vehiculeType });
    res.status(200).json(pneus);
};

export const updatePneu = async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    const updatedPneu = await Pneu.findByIdAndUpdate(id, updates, { new: true });
    if (!updatedPneu) {
        throw new HttpError("Pneu not found", 404);
    }

    res.status(200).json({ message: "Pneu updated successfully", pneu: updatedPneu });
};

export const deletePneu = async (req, res) => {
    const { id } = req.params;
    const deletedPneu = await Pneu.findByIdAndDelete(id);

    if (!deletedPneu) {
        throw new HttpError("Pneu not found", 404);
    }

    res.status(200).json({ message: "Pneu deleted successfully" });
};

export const getPneusNeedingMaintenance = async (req, res) => {
    const pneus = await Pneu.find({
        $or: [
            { usure: { $gte: 80 } },
            { etat: "À remplacer" }
        ]
    }).populate('vehiculeId');

    res.status(200).json(pneus);
};