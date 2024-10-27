import express from 'express'
import { verifyToken } from '../../middleware/verifyToken.js'
import {blockUser,getBlockedUsers} from '../../controllers/newsFeed/blockUser.controller.js'

const router = express.Router()

router.get('/:userId',verifyToken,getBlockedUsers)
router.post('/',verifyToken,blockUser)


export default router