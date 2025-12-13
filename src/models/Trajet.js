import mongoose from "mongoose";
import { instance } from "../config/db.js";

const trajetSchema = mongoose.Schema({
    nom: { type: String, required: true, trim: true },
    pointDepart: { type: String, required: true, trim: true },
    pointArrivee: { type: String, required: true, trim: true },
    distance: { type: Number, required: true },
    dureeEstimee: { type: Number, required: true },
    chauffeur: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    camion: { type: mongoose.Schema.Types.ObjectId, ref: "Camion", required: true },
    remorque: { type: mongoose.Schema.Types.ObjectId, ref: "Remorque", default: null },
    dateDepart: { type: Date, required: true },
    dateArrivee: { type: Date },
    statut: { 
        type: String, 
        enum: ["Planifie", "En cours", "Termine", "Annule"], 
        default: "Planifie" 
    },
    kilometrageDepart: { type: Number },
    kilometrageArrivee: { type: Number },
    notes: { type: String, trim: true }
}, { timestamps: true });

const Trajet = instance.model("Trajet", trajetSchema);
export default Trajet;