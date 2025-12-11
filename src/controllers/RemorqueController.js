import HttpError from "../config/HttpError.js";
import Remorque from "../models/Remorque.js";
import Camion from "../models/comion.js";

export const addRemorque = async (req, res) => {
    const { marque, numeroSerie, capaciteCharge, etat } = req.body;

    const existingRemorque = await Remorque.findOne({ numeroSerie });
    if (existingRemorque) {
        throw new HttpError("Remorque with this serial number already exists", 400);
    }

    const newRemorque = new Remorque({
        marque,
        numeroSerie,
        capaciteCharge,
        etat: etat || "Bon"
    });

    const savedRemorque = await newRemorque.save();
    if (savedRemorque) {
        res.status(201).json({ message: "Remorque created successfully", remorque: savedRemorque });
    } else {
        throw new HttpError("Failed to create remorque");
    }
};

export const getAllRemorques = async (req, res) => {
    const remorques = await Remorque.find().populate('camionAttache');
    res.status(200).json(remorques);
};

export const updateRemorque = async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    const updatedRemorque = await Remorque.findByIdAndUpdate(id, updates, { new: true });
    if (!updatedRemorque) {
        throw new HttpError("Remorque not found", 404);
    }

    res.status(200).json({ message: "Remorque updated successfully", remorque: updatedRemorque });
};

export const deleteRemorque = async (req, res) => {
    const { id } = req.params;
    const deletedRemorque = await Remorque.findByIdAndDelete(id);

    if (!deletedRemorque) {
        throw new HttpError("Remorque not found", 404);
    }

    res.status(200).json({ message: "Remorque deleted successfully" });
};

export const attachRemorqueToCamion = async (req, res) => {
    const { remorqueId, camionId } = req.body;

    const remorque = await Remorque.findById(remorqueId);
    const camion = await Camion.findById(camionId);

    if (!remorque || !camion) {
        throw new HttpError("Remorque or Camion not found", 404);
    }

    remorque.camionAttache = camionId;
    await remorque.save();

    res.status(200).json({ message: "Remorque attached to camion successfully" });
};

export const detachRemorqueFromCamion = async (req, res) => {
    const { remorqueId } = req.params;

    const remorque = await Remorque.findById(remorqueId);
    if (!remorque) {
        throw new HttpError("Remorque not found", 404);
    }

    remorque.camionAttache = null;
    await remorque.save();

    res.status(200).json({ message: "Remorque detached from camion successfully" });
};