import prisma from '../lib/prisma.js'

export const getMessages = async (req, res) => {
    const tokenUserId = req.userId;
    const chatID = req.params.id;
    try {
        const chatMsgs = await prisma.message.findMany({
            where: {
                chatId: chatID
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

        res.status(200).json({ messages: chatMsgs })
    } catch (err) {
        console.log(err)
        res.status(500).json({ messages: "Something went wrong !" })
    }
}
export const addMessage = async (req, res) => {
    const tokenUserId = req.userId
    const text = req.body.text
    const chatId = req.params.id
    try {
        const chatMsg = await prisma.chat.findUnique({
            where: {
                id: chatId,
                userIDs: {
                    hasSome: [tokenUserId]
                }
            }
        }).catch((err) => {
            console.log(err)
        })
        if (!chatMsg) return res.status(404).json({ message: 'Chat not found !' })
        const message = await prisma.message.create({
            data: {
                text,
                chatId,
                userId: tokenUserId,
                seenBy: {
                    set: [tokenUserId]
                }
            }
        })
        await prisma.chat.update({
            where: {
                id: chatId
            },
            data: {
                seenBy: [tokenUserId],
                lastMessage: text
            }
        })
        res.status(200).json(message)
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Failed to send message !" })
    }
}
export const searchText = async (req, res) => {
    const tokenUserId = req.userId;
    const { keyword } = req.body;
    try {
        let result = [];
        let chatDetail = null;
        // Find users whose username contains the keyword
        const matchingUsers = await prisma.user.findMany({
            where: { username: { contains: keyword, mode: 'insensitive' } }, // Using 'insensitive' for case-insensitive search
            select: { id: true, username: true, avatar: true },
        });
     
        // Check if the tokenUserId has a chat with each matched user
        const knownUsers = await Promise.all(
            matchingUsers.map(async (user) => {
                const chatExists = await prisma.chat.findFirst({
                    where: {
                        userIDs: { hasEvery: [tokenUserId, user.id] }, // Checking if both user IDs are present in the chat
                    }
                });
                user = {...user,chatDetail:chatExists}
                // chatDetail=chatExists
                // Only include the user if a chat exists
                return chatExists ? user : null;
            })
        );

        // Filter out null values (users without existing chats)
        const filteredUsers = knownUsers.filter((user) => user !== null);

        if (filteredUsers.length > 0) {
            // If there are users with existing chats, add them to the result
            result = { matchingUsers: filteredUsers };
        } else {
            // Otherwise, search for messages containing the keyword and seen by the user
            const searchResults = await prisma.message.findMany({
                where: {
                    seenBy: { has: tokenUserId },
                    text: { contains: keyword, mode: 'insensitive' }, // Using 'insensitive' for case-insensitive search
                },
            });

            // Fetch user details for each chat result
            const detailedResults = await Promise.all(
                searchResults.map(async (msg) => {
                    const chat = await prisma.chat.findUnique({
                        where: { id: msg.chatId },
                        select: { userIDs: true },
                    });

                    // Find the other user in the chat (not the requesting user)
                    const otherUserId = chat.userIDs.find((id) => id !== tokenUserId);

                    // Fetch details of the other user in the chat
                    const otherPersonDetail = await prisma.user.findUnique({
                        where: { id: otherUserId },
                        select: { id: true, avatar: true, username: true },
                    });

                    // Attach the other user's details to the message
                    return {
                        ...msg,
                        chatUserDetails: otherPersonDetail,
                    };
                })
            );
            result = { searchResults: detailedResults };
        }
        return res.status(200).json(result);
    } catch (err) {
        console.log('Error:', err);
        return res.status(500).json({ message: 'Something went wrong!', error: err });
    }

}