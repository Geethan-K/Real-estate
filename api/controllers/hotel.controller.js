import prisma from '../lib/prisma.js';
import jwt from 'jsonwebtoken';

export const getPosts = async (req,res) =>{
    const query = req.query;
    try{
        const posts = await prisma.hotel.findMany(
            {
                where:{
                    name:query.name || undefined,
                    city:query.city || undefined,
                    type:query.type || undefined,
                    property:query.property || undefined,
                    bedroom:parseInt(query.bedroom) || undefined,
                    price:{
                        gte:parseInt(query.min) || 0,
                        lte:parseInt(query.max) || 1000000000
                    }
                },
                include:{
             //       postDetail:true,
                   user:{
                    select:{
                        id:true,
                        username:true,
                        avatar:true
                    }
                   } 
                }
            })
        res.status(200).json(posts)
    }catch (err){
        console.log(err);
        res.status(500).json({message:"Failed to get posts !"})
    }
}
export const getPost = async (req,res) =>{
    const id = req.params.id
   
    try{
        const post = await prisma.hotel.findUnique({
            where:{id},
            include:{
            //    postDetail:true,
                user:{
                    select:{
                        id:true,
                        username:true,
                        avatar:true
                    }
                }
            }
        })
        let userId;
        const token = req.cookies?.token
        if(!token){
            userId=null
        }else{
            jwt.verify(token,process.env.JWT_SECRET_KEY,async(err,payload)=>{
                if(err){
                    userId=null
                }else{
                    userId = payload.id
                }
            })
        }
        const saved = await prisma.savedPost.findUnique({
            where:{
                userId_postId:{
                    postId:id,
                    userId
                }
            }
        })
        res.status(200).json({...post,isSaved:saved ? true:false})
    }catch (err){
        console.log(err);
        res.status(500).json({message:"Failed to get post !"})
    }
}
export const addPost = async (req,res) =>{
    const body = req.body
    const tokenUserId = req.userId
    try{
        const newPost = await prisma.hotel.create({
            data:{
                ...body.postData,
                userId:tokenUserId,
                // postDetail:{
                //     create:body.postDetail
                // }
            }
        }).catch((err)=>{
            console.log(err)
        })
        res.status(200).json(newPost)
        
    }catch (err){
        console.log(err);
        res.status(500).json({message:"Failed to add post !"})
    }
}
export const updatePost = async (req,res) =>{
    try{

        res.status(200).json()
    }catch (err){
        console.log(err);
        res.status(500).json({message:"Failed to update post !"})
    }
}
export const deletePost = async (req,res) =>{
    const id = req.params.id
    const tokenUserId = req.userId
    try{
        const post = await prisma.hotel.findUnique({
            where:{id}
        })
        if(post.userId!==tokenUserId){
            return res.status(403).json({message:"Not Authorized !"})
        }
        await prisma.hotel.delete({
            where:{id}
        })
        res.status(200).json({message:'Post deleted Successfully !!!'})
    }catch (err){
        console.log(err);
        res.status(500).json({message:"Failed to delete post !"})
    }
}

export const profilePosts = async (req,res) => {
    const tokenUserId = req.userId
    try{
        const userPosts = await prisma.hotel.findMany({
            where:{userId:tokenUserId}
        });
        const saved = await prisma.savedPost.findMany({
            where:{userId:tokenUserId} ,
            include:{post:true}
        })
       
        const savedPosts = saved.map((item)=>(item.post))
       res.status(200).json({userPosts,savedPosts})
    }catch(err){
        console.log(err);
        res.status(500).json({message:"Failed to get profile posts !"})
    }
}