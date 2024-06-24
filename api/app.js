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


const PORT=3000

app.use(cors({origin:process.env.CLIENT_URL,credentials:true}))
app.use(express.json())
app.use(cookieParser())


app.use("/api/auth",authRoute)
app.use('/api/test',testRoute)
app.use('/api/users',usersRoute)
app.use('/api/posts',postsRoute)
app.use('/api/chats',chatsRoute)
app.use('/api/message',messageRoute)

app.listen(PORT,()=>{
    console.log('app listening on port '+PORT)
})