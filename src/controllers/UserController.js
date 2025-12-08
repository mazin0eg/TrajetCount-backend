    import User from "../models/User.js";
    import bcrypt from "bcrypt"

    export const register = async (req, res) => {
        try {
            const { username, email, password, confirmPassword } = req.body;

            const existingusers = await User.findOne({ username });
            if (existingusers) {
                return res.status(400).json({ message: "user already exist" })
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

        } catch (err) {
            return res.status(500).json({message : err.message})
        }

    }