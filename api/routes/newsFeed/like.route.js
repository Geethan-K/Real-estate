import express from 'express'
import { verifyToken } from '../../middleware/verifyToken.js'
import {toggleLike,getLikesByPostId} from '../../controllers/newsFeed/like.controller.js'

const router = express.Router()

router.post('/',verifyToken,toggleLike)
router.get('/:postId',verifyToken,getLikesByPostId)


export default router