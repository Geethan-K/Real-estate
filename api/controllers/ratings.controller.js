import prisma from '../lib/prisma.js';

export const getComments = async (req,res) => {
   const {postId} = req.body
    try{
        const res = await prisma.comment.findMany({
           where:{postId},
            include:{
                user:true
            }
        })
        res.status(200).json(res)
    }catch(err){
        console.log(err)
        res.status(500).json({message: "OOps ! something went wrong !"})
    }
}


export const getRatings = async (req,res) => {
    const {postId} = req.body
     try{
         const res = await prisma.rating.findMany({
            where:{postId},
             include:{
                 user:true
             }
         })
         res.status(200).json(res)
     }catch(err){
         console.log(err)
         res.status(500).json({message: "OOps ! something went wrong !"})
     }
 }
 

export const addComment = async (req, res) => {
    const { postId, content } = req.body
    const userId = req.userId
    try {
        const res = await prisma.comment.create({
            data: {
                postId,
                content,
                userId
            }
        })
        res.status(200).json(res)
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Oops ! something went wrong !" })
    }
}

export const addRating = async (req, res) => {
    const { postId, stars } = req.body
    const userId = req.userId
    try {
        const rating = await prisma.rating.create({
            data: {
                stars,
                postId,
                userId
            }
        })
        res.status(200).json(rating)
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "oops ! something went wrong !" })
    }
}