import prisma from '../lib/prisma.js'

export const getChats = async (req,res) =>{
    const tokenUserId = req.userId
    try{
        const chats = await prisma.chat.findMany({
            where:{
                userIDs:{
                    hasSome:[tokenUserId]
                }
            }
        });
        for (const chat of chats){
            const receiverId = chat.userIDs.find((id)=>id!==tokenUserId);
            const receiverDetails = await prisma.user.findUnique({
                where:{
                    id:receiverId
                },
                select:{
                    id:true,
                    username:true,
                    avatar:true
                }
            });
            chat.receiver = receiverDetails
           }
        res.status(200).json(chats)
    }catch(err){
        console.log(err)
        res.status(500).json({message: "Failed to get chats !"})
    }
}

export const getChatId = async(req,res) =>{
    const tokenUserId = req.userId
    const receiverId = req.params.id
    try{
        const chatID = await prisma.chat.findFirst({
            where:{
                userIDs:{
                    hasEvery:[tokenUserId,receiverId]
                }
            },
            select:{
                id:true
            }
        })
        res.status(200).json(chatID)
    }catch(err){
        console.log(err)
        res.status(500).json({message: "Failed to get chat !"})
    }
}


export const getChat = async (req,res) =>{
    const tokenUserId = req.userId
    try{
        const chatMessage = await prisma.chat.findUnique({
            where:{
                id:req.params.id,
                userIDs:{
                    hasSome:[tokenUserId]
                }
            },
            include:{
                messages:{
                    orderBy:{
                        createdAt:'asc'
                    }
                }
            }
        })
        await prisma.chat.update({
            where:{
                id:req.params.id
            },
            data:{
                seenBy:{
                    set:[tokenUserId]
                }
            }
        })
        res.status(200).json(chatMessage)
    }catch(err){
        console.log(err)
        res.status(500).json({message: "Failed to get chat !"})
    }
}

export const addChat = async (req,res) =>{
    const tokenUserId = req.userId
    try{
        const newChat = await prisma.chat.create({
            data:{
                userIDs:[tokenUserId,req.body.receiverId]
            }
        })
        res.status(200).json(newChat)
    }catch(err){
        console.log(err)
        res.status(500).json({message: "Failed to add chat !"})
    }
}

export const readChat = async (req,res) =>{
    const tokenUserId = req.userId
    try{
        const chat = await prisma.chat.update({
            where:{
                id:req.params.id,
                userIDs:{
                    hasSome:[tokenUserId]
                }
            },
            data:{
                seenBy:{
                    set:[tokenUserId]
                }
            }
        })
        res.status(200).json(chat)
    }catch(err){
        console.log(err)
        res.status(500).json({message: "Failed to read chat !"})
    }
}