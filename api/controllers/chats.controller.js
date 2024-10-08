import prisma from '../lib/prisma.js'
import { format, isToday, isYesterday, isThisWeek } from 'date-fns';

export const getChats = async (req, res) => {
    const tokenUserId = req.userId
    try {
        const chats = await prisma.chat.findMany({
            where: {
                userIDs: {
                    hasSome: [tokenUserId]
                },
            }
        });

        
        for (let i = chats.length - 1; i >= 0; i--) {
            const chat = chats[i];
            // Get the message associated with the last message in the chat
            const msgdUser = await prisma.message.findFirst({
                where: { chatId: chat.id, text: chat.lastMessage }
            });
        
            const senderID = chat.userIDs.find((id) => id == msgdUser.userId);
            const receiverID = chat.userIDs.find((id) => id !== msgdUser.userId)
            // Check if the senderID is the tokenUserId
            // if (senderID == tokenUserId) {
            //     // Remove chat if senderID matches tokenUserId
            //     chats.splice(i, 1);
            // } else {
                // Fetch sender details
                const receiverDetails = await prisma.user.findUnique({
                    where:{id:receiverID},
                    select:{
                        id: true,
                        username: true,
                        avatar: true 
                    }
                })
                const senderDetails = await prisma.user.findUnique({
                    where: {
                        id: senderID
                    },
                    select: {
                        id: true,
                        username: true,
                        avatar: true
                    }
                });
                // Add sender details to chat
                chat.sender = senderDetails;
                chat.receiver = receiverDetails;
        }
       res.status(200).json(chats)
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Failed to get chats !" })
    }
}
export const getReceiverStatus = async (req, res) => {
    const receiverId = req.id
    const isReceiverActive = await prisma.loginInfo.findFirst({
        where: { userId: receiverId }
    })
    res.status(200).json(isReceiverActive)
}
export const getChatId = async (req, res) => {
    const tokenUserId = req.userId
    const receiverId = req.params.id
    try {
        const chatID = await prisma.chat.findFirst({
            where: {
                userIDs: {
                    hasEvery: [tokenUserId, receiverId]
                }
            },
            select: {
                id: true
            }
        })
        res.status(200).json(chatID)
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Failed to get chat !" })
    }
}


export const getChat = async (req, res) => {
    const tokenUserId = req.userId
    try {
        const chatMessage = await prisma.chat.findUnique({
            where: {
                id: req.params.id,
                userIDs: {
                    hasSome: [tokenUserId]
                }
            },
            include: {
                messages: {
                    orderBy: {
                        createdAt: 'asc'
                    }
                }
            }
        })
        // if (!chatMessage.seenBy.includes(tokenUserId)){
        //     await prisma.chat.update({
        //         where: {
        //             id: req.params.id
        //         },
        //         data: {
        //             seenBy: {
        //                 set: [...chatMessage.seenBy,tokenUserId]
        //             }
        //         }
        //     })
        // }
        
        // await prisma.message.update({
        //     where:{
        //         chatId:req.params.id,
        //     },
        //     data:{
        //         seenBy:{
        //             set:[tokenUserId]
        //         }
        //     }
        // })
        const groupMessagesByDate = (messages) => {
            return messages.reduce((groupedMessages, message) => {
                
                // Extract the date (without the time) from the message
                const date = new Date(message.createdAt).toLocaleDateString();

                // If this date doesn't exist in the groupedMessages object, create an array for it
                if (!groupedMessages[date]) {
                    groupedMessages[date] =[];
                  //  groupedMessages[date] = {chats:[],displayDate:''};
                }

               
                // // Add displayDate only once for this group
                // if (!groupedMessages[date].displayDate) {
                //     const dateObj = new Date(message.createdAt);

                //     // Determine how to format the date (Today, Yesterday, Day of week, or DD MMM)
                //     if (isToday(dateObj)) {
                //         groupedMessages[date].displayDate = "Today";
                //     } else if (isYesterday(dateObj)) {
                //         groupedMessages[date].displayDate = "Yesterday";
                //     } else if (isThisWeek(dateObj)) {
                //         groupedMessages[date].displayDate = format(dateObj, 'EEEE'); // Day of the week
                //     } else {
                //         groupedMessages[date].displayDate = format(dateObj, 'dd MMM'); // "DD MMM" for older dates
                //     }
                // }
                 // Add the message to the array for this date
                 groupedMessages[date].push(message);
                return groupedMessages;
            }, {}); // Initial value is an empty object
        };

        chatMessage.messages = groupMessagesByDate(chatMessage.messages)
      //  console.log(chatMessage.messages)
        res.status(200).json(chatMessage)
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Failed to get chat !" })
    }
}

export const addChat = async (req, res) => {
    const tokenUserId = req.userId
    try {
        const newChat = await prisma.chat.create({
            data: {
                userIDs: [tokenUserId, req.body.receiverId]
            }
        })
      //  console.log('new chat added with userID',req.userID)
        res.status(200).json(newChat)
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Failed to add chat !" })
    }
}

export const readChat = async (req, res) => {
    const tokenUserId = req.userId
    try {

        const chat = await prisma.chat.update({
            where: {
                id: req.params.id,
                userIDs: {
                    hasSome: [tokenUserId]
                }
            },
            data: {
                seenBy: {
                    set: [tokenUserId]
                }
            }
        })
        const chatMsgs = await prisma.message.findMany({
            where:{chatId:req.params.id}
        })
        const lastMessage = chatMsgs[chatMsgs.length-1]
    
        
        if(lastMessage && !lastMessage.seenBy.includes(tokenUserId)){
             await prisma.message.update({
                 where:{
                         id:lastMessage.id,chatId:req.params.id,
                 },
                 data:{
                     seenBy:{
                         set:[...lastMessage.seenBy,tokenUserId]
                     }
                 }
             })
        }
      
        // await prisma.message.update({
        //     where:{
        //         chatId:req.params.id,
        //     },
        //     data:{
        //         seenBy:{
        //             set:[tokenUserId]
        //         }
        //     }
        // })
        res.status(200).json(chat)
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Failed to read chat !" })
    }
}