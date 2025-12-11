import mongoose from "mongoose";
import { instance } from "../config/db.js";

const pneuSchema = mongoose.Schema({
    marque: { type: String, required: true, trim: true },
    taille: { type: String, required: true, trim: true },
    pression: { type: Number, required: true },
    usure: { type: Number, min: 0, max: 100, default: 0 },
    etat: { type: String, enum: ["Neuf", "Bon", "Usé", "À remplacer"], default: "Neuf" },
    vehiculeId: { type: mongoose.Schema.Types.ObjectId, refPath: "vehiculeType" },
    vehiculeType: { type: String, enum: ["Camion", "Remorque"] },
    position: { type: String, required: true }
}, { timestamps: true });

const Pneu = instance.model("Pneu", pneuSchema);
export default Pneu;