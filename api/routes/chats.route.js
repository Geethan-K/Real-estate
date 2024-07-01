import express from 'express'
import { verifyToken } from '../middleware/verifyToken.js'
import { addChat, getChat, getChatId, getChats, readChat } from '../controllers/chats.controller.js'

const router = express.Router()

router.get('/',verifyToken,getChats)
router.get('/:id',verifyToken,getChat)
router.get('/get/:id',verifyToken,getChatId)
router.post('/',verifyToken,addChat)
router.put('/read/:id',verifyToken,readChat)

export default router