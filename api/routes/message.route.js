import express from 'express'
import { verifyToken } from '../middleware/verifyToken.js'
import { addMessage ,getMessages,searchText} from '../controllers/message.controller.js'

const router = express.Router()

router.post('/:id',verifyToken,addMessage)
router.get('/:id',verifyToken,getMessages)
router.post('/search/:id',verifyToken,searchText)

export default router