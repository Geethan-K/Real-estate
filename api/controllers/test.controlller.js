import jwt from 'jsonwebtoken'
export const shouldBeLoggedIn = async (req, res) => {
    const token = req.cookies.token
    if (!token) return res.status(401).json({ message: 'User not Authenticated !' })
    jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, payload) => {
        if (err) return res.status(401).json({ message: 'User not Authenticated !' })
    })
    res.status(200).json({message:'Authentication successfull !!!'})
}
export const shouldBeAdmin = async (req, res) => {
    const token = req.cookies.token
    if(!token) return res.status(410).json({message:'User not authenticated !!'})
        jwt.verify(token,process.env.JWT_SECRET_KEY,async(req,res)=>{
            if(!token.isAdmin){
                return res.status(403).json({message:'USer not authenticated as admin !'})
            }
        })
        res.status(200).json({message:'You are authenticated !!'})
}