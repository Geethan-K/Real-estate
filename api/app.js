import express from 'express'
import cookieParser from 'cookie-parser'
const app = express()
import postsRoute from './routes/posts.route.js'
import authRoute from './routes/auth.route.js'
import testRoute from './routes/test.route.js'
import usersRoute from './routes/user.route.js'
import cors from 'cors'
import  chatsRoute  from './routes/chats.route.js'
import  messageRoute  from './routes/message.route.js'
import hotel from './routes/hotel.route.js'
import ratingsRoute from './routes/ratings.route.js'
import newsFeedRoute from './routes/newsFeed/newsfeed.route.js'
import likesRoute from './routes/newsFeed/like.route.js'
import sharesRoute from './routes/newsFeed/share.route.js'
import commentRoute from './routes/newsFeed/comment.route.js'
import notificationRoute from './routes/newsFeed/notification.route.js'
import followRoute from './routes/newsFeed/follow.route.js'
import blockUserRoute from './routes/newsFeed/block.route.js'


const PORT=3000

//app.use(cors({origin:process.env.CLIENT_URL,credentials:true}))
app.use(cors({origin:process.env.CLIENT_URL,credentials:true}))
app.use(express.json())
app.use(cookieParser())


app.use("/api/auth",authRoute)
app.use('/api/test',testRoute)
app.use('/api/users',usersRoute)
app.use('/api/posts',postsRoute)
app.use('/api/hotels',hotel)
app.use('/api/chats',chatsRoute)
app.use('/api/commentsAndRatings',ratingsRoute)
app.use('/api/message',messageRoute)

app.use('/api/newsFeed',newsFeedRoute)
app.use('/api/comment',commentRoute)
app.use('/api/follow',followRoute)
app.use('/api/like',likesRoute)
app.use('/api/share',sharesRoute)
app.use('/api/notifications',notificationRoute)
app.use('/api/blockUser',blockUserRoute)


app.listen(PORT,()=>{
    console.log('app listening on port '+PORT)
})