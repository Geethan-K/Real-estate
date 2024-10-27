import express from 'express'
import { verifyToken } from '../../middleware/verifyToken.js'
import {getSharesCount,sharePost} from '../../controllers/newsFeed/share.controller.js'

const router = express.Router()

router.get('/getSharesCount/:postId',verifyToken,getSharesCount)
router.post('/',verifyToken,sharePost)


export default router