import mongoose from "mongoose";
import { instance } from "../config/db.js";

const remorqueSchema = mongoose.Schema({
    marque: { type: String, required: true, trim: true },
    numeroSerie: { type: String, required: true, unique: true, trim: true },
    capaciteCharge: { type: Number, required: true },
    etat: { type: String, enum: ["Bon", "Mauvais", "En reparation"], default: "Bon" },
    camionAttache: { type: mongoose.Schema.Types.ObjectId, ref: "Camion", default: null }
}, { timestamps: true });

const Remorque = instance.model("Remorque", remorqueSchema);
export default Remorque;