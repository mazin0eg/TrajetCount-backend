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