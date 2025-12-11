import HttpError from "../config/HttpError.js";
import Camion from "../models/comion.js";
import User from "../models/User.js";

export const addCamion = async (req, res) => {
    const { marque, kilometrage, currentChauffeur } = req.body
    let chauffeur = null;
    if (currentChauffeur) {
        chauffeur = await User.findOne({ username: currentChauffeur });
        if (chauffeur.role !== 'Chauffeur') throw new HttpError('This user cant be a truck pilote')
    }


    const newCamion = new Camion({
        marquer: marque,
        kilometrage: kilometrage || 0,
        currentChauffeur: chauffeur?.username || null,
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

export const updateCamion = async (req, res) => {
    const { id } = req.params;
    const { marque, kilometrage, currentChauffeur } = req.body;

    let chauffeur = null;
    if (currentChauffeur) {
        chauffeur = await User.findOne({ username: currentChauffeur });
        if (chauffeur && chauffeur.role !== 'Chauffeur') {
            throw new HttpError('This user cant be a truck pilote', 400);
        }
    }

    const updateData = {};
    if (marque) updateData.marquer = marque;
    if (kilometrage !== undefined) updateData.kilometrage = kilometrage;
    if (currentChauffeur !== undefined) updateData.currentChauffeur = chauffeur?.username || null;

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