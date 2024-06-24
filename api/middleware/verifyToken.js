import jwt from 'jsonwebtoken'

export const verifyToken = (req,res,next) =>{
    const token = req.cookies.token
    if(!token) return res.status(401).json({message:'User not Authorized !'})
        jwt.verify(token,process.env.JWT_SECRET_KEY,(err,payload)=>{
            req.userId = payload.id,
            next();
        })
}