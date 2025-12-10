import mongoose, { Schema } from "mongoose";
import { instance } from "../config/db.js";
 const camionSchema = mongoose.Schema({
    marquer:  {type : String , required : true , trim : true},
    kilometrage :  {type : Number ,  required : true , trim : true},
    currentChauffeur :  {type : String , unique : true ,  trim : true}
 })

const Camion =  instance.model("Camion",camionSchema)
export default Camion