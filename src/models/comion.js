import mongoose, { Schema } from "mongoose";
import { instance } from "../config/db.js";
 const camionSchema = mongoose.Schema({
    marque:  {type : String , required : true , trim : true},
    kilometrage :  {type : Number ,  required : true , trim : true},
    disponible: {type : Boolean, default: true}
 })

const Camion =  instance.model("Camion",camionSchema)
export default Camion