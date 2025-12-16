import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Trajet from "../models/Trajet.js";
import bcrypt from "bcrypt"
import HttpError from "../config/HttpError.js";

export const register = async (req, res) => {
    const { username, email, password, confirmPassword } = req.body;

    const user = await User.findOne({ username });
    if (user) {
        throw new HttpError("user already exist", 401)
    }
    const salt = await bcrypt.genSalt(10)
    const hashpassword = await bcrypt.hash(password, salt)
    if (confirmPassword != password) {
        throw new HttpError("passwords are not the same ", 400)
    }
    const newUser = new User({
        username,
        password: hashpassword,
        email: email
    })

    const saveduser = await newUser.save()


    if (saveduser) {
        const payload = {
            userId: saveduser._id,
            username: saveduser.username
        }
        const accesstoken = jwt.sign(payload, process.env.ACCESS_TOKEN, { expiresIn: "1h" })
        return res.status(201).json({
            message: "User registered successfully",
            user: {
                id: saveduser._id,
                username: saveduser.username,
                email: saveduser.email,
                token: accesstoken
            }
        });
    }

    throw new HttpError('registration faild')

}

export const login = async (req, res) => {

    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        throw new HttpError("user not found", 404)
    }

    const ismatching = await bcrypt.compare(password, user.password)
    if (!ismatching) {
        throw new HttpError("invalid password", 401)
    }



    const payload = {
        userId: user._id,
        username: user.username,
        role : user.role
    }

    const accesstoken = jwt.sign(payload, process.env.ACCESS_TOKEN, { expiresIn: "1h" })

    res.status(200).json({
        message: `login succesfully a si ${user.role}`,
        token: accesstoken,
        user : user

    })


}


export const me = (req, res) => {
    res.json(req.user);
}

export const getAllChauffeurs = async (req, res) => {
    const chauffeurs = await User.find({ role: "Chauffeur" })
        .populate('nombreTrajets')
        .select('username email createdAt');
    
    res.status(200).json(chauffeurs);
}

export const getChauffeurStats = async (req, res) => {
    const { id } = req.params;
    
    const chauffeur = await User.findById(id)
        .populate('nombreTrajets')
        .select('username email role createdAt');
        
    if (!chauffeur || chauffeur.role !== 'Chauffeur') {
        throw new HttpError("Chauffeur not found", 404);
    }
    
    const [
        totalTrajets,
        trajetsEnCours,
        trajetsPlanifies,
        trajetsTermines,
        trajetsAnnules
    ] = await Promise.all([
        Trajet.countDocuments({ chauffeur: id }),
        Trajet.countDocuments({ chauffeur: id, statut: "En cours" }),
        Trajet.countDocuments({ chauffeur: id, statut: "Planifie" }),
        Trajet.countDocuments({ chauffeur: id, statut: "Termine" }),
        Trajet.countDocuments({ chauffeur: id, statut: "Annule" })
    ]);
    
    res.status(200).json({
        chauffeur: {
            id: chauffeur._id,
            username: chauffeur.username,
            email: chauffeur.email,
            createdAt: chauffeur.createdAt
        },
        statistiques: {
            totalTrajets,
            trajetsEnCours,
            trajetsPlanifies,
            trajetsTermines,
            trajetsAnnules
        }
    });
}