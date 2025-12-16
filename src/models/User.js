import mongoose from "mongoose";
import { instance } from "../config/db.js";

const UserSchema = mongoose.Schema({
    username : {type : String , unique : true , required : true , trim : true},
    email : {type : String , unique : true , required : true , trim : true},
    password : {type : String , required : true , trim : true},
    role : {type : String , enum : ["admin" , "Chauffeur"], default: "Chauffeur"}
    
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })

UserSchema.virtual('nombreTrajets', {
    ref: 'Trajet',
    localField: '_id',
    foreignField: 'chauffeur',
    count: true
});

const User = instance.model("User" ,  UserSchema);
export default User;