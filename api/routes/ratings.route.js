import express from 'express'
import { verifyToken } from '../middleware/verifyToken.js'
//import { addChat, getChat, getChatId, getChats, readChat } from '../controllers/chats.controller.js'
import { getRatings,getComments,addRating,addComment } from '../controllers/ratings.controller.js'

const router = express.Router()

router.get('/ratings',verifyToken,getRatings)
router.get('/comments',verifyToken,getComments)
router.post('/ratings/add',verifyToken,addRating)
router.post('/comments/add',verifyToken,addComment)

export default router