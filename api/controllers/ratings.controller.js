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
        const alreadyExists = await prisma.comment.findFirst({
            where:{
                postId,
                userId
            },
        })
        if(!alreadyExists){
            const newComment = await prisma.comment.create({
                data: {
                    postId,
                    content,
                    userId
                }
            })
         res.status(200).json(newComment)
        }
        if(alreadyExists){
            const updateComment = await prisma.comment.update({
                where:{
                    id:alreadyExists.id,
                    userId,
                    postId
                },
                data:{
                    content
                }
            })
            res.status(200).json(updateComment)
        }
      
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Oops ! something went wrong !" })
    }
}

export const addRating = async (req, res) => {
    const { postId, stars } = req.body
    const userId = req.userId
    try {
        const alreadyExists = await prisma.rating.findFirst({
            where:{
                postId:postId,
                userId:userId
            }
        })
        console.log('exists already',alreadyExists)
        if(alreadyExists){
            const updateRating = await prisma.rating.update({
                where:{
                    id:alreadyExists.id,
                    postId,
                    userId
                },
                data:{
                    stars
                }
            })
            res.status(200).json(updateRating)
        }
        if(!alreadyExists){
           const addRating =  await prisma.rating.create({
                data: {
                    stars,
                    postId,
                    userId
                }
            })
            res.status(200).json(addRating)
        }
        
      
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "oops ! something went wrong !" })
    }
}