import {Server} from 'socket.io'

const io = new Server({
    cors:{
        origin:"http://localhost:5173"
    }
});

let onlineUsers = [];

const addUser = (userID,socketID) => {
    const userExists = onlineUsers.find((user)=>user.userId==userID);
    if(!userExists) onlineUsers.push({userId:userID,socketId:socketID});   
}
const removeUser = (socketID) => {
    onlineUsers.filter((user)=>user.socketId!==socketID)
}
const getUser = (userID) =>{
    return onlineUsers.find((user)=>user.userId==userID)
}
io.on("connection",(socket)=>{
    socket.on("newUser",(userId)=>{
        addUser(userId,socket.id)
    });
    socket.on("disconnect",(userId)=>{
        removeUser(socket.id)
    })
    socket.on("sendMessage",({receiverId,data})=>{
        const receiver = getUser(receiverId);
        io.to(receiver.socketId).emit("getMessage",data)
    })
})
io.listen("4000")