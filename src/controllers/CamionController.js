import HttpError from "../config/HttpError.js";
import Camion from "../models/comion.js";
import User from "../models/User.js";

export const addCamion = async (req, res) => {
    const { marque, kilometrage } = req.body

    const newCamion = new Camion({
        marque: marque,
        kilometrage: kilometrage || 0
    })

    const savedcamion = await newCamion.save()

    if (savedcamion) {
        res.json({ message: "truck saved successfuly" })
    } else {
        throw new HttpError("camion faild to be created")
    }
}

export const deletCamion = async (req, res) => {
    const { id } = req.params
    const deletcamion = await Camion.findByIdAndDelete(id )

    if (!deletcamion) {
        throw new HttpError("camion not found")
    }else{
        return res.status(201).json({message: "camion deleted"})
    }


}

export const getAllCamions = async(req , res)=>{
    const camions = await Camion.find()
    if (!camions || camions.length === 0) {
        throw new HttpError("No camion found", 404);
    }

    res.status(200).json(camions);
}

export const getAvailableCamions = async(req , res)=>{
    const camions = await Camion.find({ disponible: true })
    res.status(200).json(camions);
}

export const updateCamion = async (req, res) => {
    const { id } = req.params;
    const { marque, kilometrage, disponible } = req.body;

    const updateData = {};
    if (marque) updateData.marque = marque;
    if (kilometrage !== undefined) updateData.kilometrage = kilometrage;
    if (disponible !== undefined) updateData.disponible = disponible;

    const updatedCamion = await Camion.findByIdAndUpdate(id, updateData, { new: true });
    
    if (!updatedCamion) {
        throw new HttpError("Camion not found", 404);
    }

    res.status(200).json({ message: "Camion updated successfully", camion: updatedCamion });
}

export const getCamionById = async (req, res) => {
    const { id } = req.params;
    const camion = await Camion.findById(id);

    if (!camion) {
        throw new HttpError("Camion not found", 404);
    }

    res.status(200).json(camion);
}