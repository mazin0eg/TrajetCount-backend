import jwt from "jsonwebtoken";
import User from "../models/User.js";
import bcrypt from "bcrypt"
import HttpError from "../config/HttpError.js";

export const register = async (req, res) => {
    const { username, email, password, confirmPassword } = req.body;

    const existingusers = await User.findOne({ username });
    if (existingusers) {
        throw new HttpError("user already exist", 401)
    }
    const salt = await bcrypt.genSalt(10)
    const hashpassword = await bcrypt.hash(password, salt)
    if (confirmPassword != password) {
        return res.status(400).json({ message: "passwords are not the same " })
    }
    const newUser = new User({
        username,
        password: hashpassword,
        email: email
    })

    await newUser.save()

    res.status(201).json({
        message: "User registered successfully",
        user: {
            id: newUser._id,
            username: newUser.username,
            email: newUser.email
        }
    });

}

export const login = async (req, res) => {

    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        throw new HttpError("user not found")
    }

        const ismatching = await bcrypt.compare(password, user.password)
        if (!ismatching) {
            throw new HttpError("invalid password", 401)
        }



        const payload = {
            userId: user._id,
            username: user.username
        }

        const accesstoken = jwt.sign(payload, process.env.ACCESS_TOKEN, { expiresIn: "1h" })

        res.status(200).json({
            message: "login succesfully",
            token: accesstoken
        })

   
}