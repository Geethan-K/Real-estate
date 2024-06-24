import prisma from '../lib/prisma.js'
import bcrypt from 'bcrypt'

export const getUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany();
        res.status(200).json(users)
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: 'Failed to get users !' })
    }
}
export const getUser = async (req, res) => {
    const id = req.params.id
    try {
        const user = await prisma.user.findUnique({
            where: { id }
        })
        res.status(200).json(user)
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: 'Failed to get user !' })
    }
}
export const updateUser = async (req, res) => {
    const id = req.params.id
    const tokenId = req.userId
    const body = req.body
    const {password,avatar,...inputs} = req.body
    console.log('password upd',password)
    var updatedPassword = null;
    
    if (id !== tokenId) {
        res.status(403).json({ message: 'user not found' })
    }
    if(password){

        const hashedPasswd = await new Promise((resolve,reject)=>{
            bcrypt.hash(password,10,(err,hash)=>{
                if(err){
                    console.log(err)
                    reject(err)
                }
                resolve(hash)
            })
        })
        
        updatedPassword=hashedPasswd
   //     updatedPassword = bcrypt.hash(password,10,()=>{})
        console.log('encrypted passwd',updatedPassword)
    }
    try {
        const updateUser = await prisma.user.update({
            where: { id },
            data: 
            {
                ...inputs,
                ...(updatedPassword && {password:updatedPassword}),
                ...(avatar && {avatar})
            }
        })
        const {password:userPassword,...rest} = updateUser
        res.status(200).json(rest);
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: 'Failed to update user !' })
    }
}
export const deleteUser = async (req, res) => {
    const id = req.params.id;
        const tokenUserId = req.userId
        if(id!==userId){
            res.status(403).json({message:'Not Authorized !'})
        }
    try {
            await prisma.user.delete({
                where:{id}
            })  
            res.status(200).json({message:'User deleted successfully !!'})     
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: 'Failed to delete user !' })
    }
}
export const savePost = async(req,res) => {
    const postId = req.body.postId
    const tokenUserId = req.userId
    try{
        const savedPost = await prisma.savedPost.findUnique({
            where:{
                userId_postId:{
                    userId:tokenUserId,
                    postId
                }
            }
        })
        if(savedPost){
            await prisma.savedPost.delete({
                where:{
                    id:savedPost.id,
                }
            })
            console.log('post already exist , so going to delete ')
            res.status(200).json({message:"Post removed from saved list"})
        }else{
            await prisma.savedPost.create({
               data:{
                userId:tokenUserId,
                postId
               }
            })
            console.log('post not exist , so going to save ')
          
            res.status(200).json({message:"Post Saved !"})
        }
      //  res.status(200).json({message:"USer deleted successfully !"})
    }catch(err){
        console.log(err)
        res.status(500).json({message:"Failed to delete user !"})
    }
}