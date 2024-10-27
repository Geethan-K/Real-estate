import express from 'express'
import { verifyToken } from '../../middleware/verifyToken.js'
//import { addChat, getChat, getChatId, getChats, readChat } from '../controllers/chats.controller.js'
import {addComment,getCommentsByPostId} from '../../controllers/newsFeed/comment.controller.js'
const router = express.Router()

router.post('/add',verifyToken,addComment)
router.get('/get/:postId',verifyToken,getCommentsByPostId)

export default router