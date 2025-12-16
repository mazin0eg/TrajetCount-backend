import mongoose, { Schema } from "mongoose";
import { instance } from "../config/db.js";
 const camionSchema = mongoose.Schema({
    marque:  {type : String , required : true , trim : true},
    immatriculation: {type : String , required : true , unique : true , trim : true},
    kilometrage :  {type : Number ,  required : true , trim : true},
    disponible: {type : Boolean, default: true},
    remorqueAttachee: {type : mongoose.Schema.Types.ObjectId, ref: "Remorque", default: null}
 })

const Camion =  instance.model("Camion",camionSchema)
export default Camion