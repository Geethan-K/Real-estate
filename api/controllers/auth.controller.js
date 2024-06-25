// file for db operations
import bcrypt from 'bcrypt'
import prisma from '../lib/prisma.js'
import jwt from 'jsonwebtoken'

export const login = async (req, res) => {
    const { username, password } = req.body
    const age = 1000 * 60 * 60 * 24 * 7
    
    try {
        const user = await prisma.user.findUnique({
            where: { username }
        })
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials !' })
        } else {
            const isPswdValid = await bcrypt.compare(password, user.password)
            if (!isPswdValid) return res.status(401).json({ message: 'Invalid credentials !' })
            const token = jwt.sign({ id: user.id,isAdmin:true }, process.env.JWT_SECRET_KEY, { expiresIn: age })
            const {password:userPassword,...userinfo} = user

            res.cookie("token", token, { httpOnly: true, maxAge: age }).status(200).json(userinfo)
        }
    } catch (err) {
        return res.status(400).json({ message: 'Something went wrong !' })
    }
}
export const logout = (req, res) => {
    res.clearCookie("token").status(200).json({message:"Logout Successfull !!"})
}

export const register = async (req, res) => {
    const { username, email, password } = req.body

    const hashedPassword = await bcrypt.hash(password, 10)
    try {
        const newUser = await prisma.user.create(
            {
                data: {
                    username,
                    email,
                    password: hashedPassword,

                }
            }
        )
        res.status(200).json({message:'User created successfully !'})
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Failed to create user !!!',error:err })
    }
}