import prisma from '../lib/prisma.js'

export const getMessages = async (req,res) =>{
    const tokenUserId = req.userId;
    const chatID = req.params.id;
    try{
        const chatMsgs = await prisma.message.findMany({
            where:{
                chatId:chatID
            },
        })
    //    const lastMessage = chatMsg[chatMsgs.length-1].id
    //    if(lastMessage && lastMessage.seenBy.includes(tokenUserId)){
    //         await prisma.message.update({
    //             where:{
    //                     id:lastMessage.id,chatId:req.params.id,
    //             },
    //             data:{
    //                 seenBy:{
    //                     set:[...lastMessage.seenBy,tokenUserId]
    //                 }
    //             }
    //         })
    //    }
       
        res.status(200).json({messages:chatMsgs})
    }catch(err){
        console.log(err)
        res.status(500).json({messages:"Something went wrong !"})
    }
}
export const addMessage = async (req,res) => {
    const tokenUserId = req.userId
    const text = req.body.text
    const chatId = req.params.id
    try{
        const chatMsg = await prisma.chat.findUnique({
            where:{
                id:chatId,
                userIDs:{
                    hasSome:[tokenUserId]
                }
            }
        }).catch((err)=>{
            console.log(err)
        })
        if(!chatMsg) return res.status(404).json({message:'Chat not found !'})
        const message = await prisma.message.create({
            data:{
                text,
                chatId,
                userId:tokenUserId,
                seenBy:{
                    set:[tokenUserId]
                }
            }
        })
        await prisma.chat.update({
            where:{
                id:chatId
            },
            data:{
                seenBy:[tokenUserId],
                lastMessage:text
            }
        })
        res.status(200).json(message)
    }catch(err){
        console.log(err)
        res.status(500).json({message:"Failed to send message !"})
    }
}