import express from 'express'
import { verifyToken } from '../middleware/verifyToken.js'
import { addMessage ,getMessages} from '../controllers/message.controller.js'

const router = express.Router()

router.post('/:id',verifyToken,addMessage)
router.get('/:id',verifyToken,getMessages)
export default router