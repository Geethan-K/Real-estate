import express from 'express'
import { verifyToken } from '../../middleware/verifyToken.js'
import {getFeed,getUserPosts,getPostById,createPost} from '../../controllers/newsFeed/newsfeed.controller.js'

const router = express.Router()

router.get('/getFeed/:userId',verifyToken,getFeed)
router.get('/getUserPosts/:userId',verifyToken,getUserPosts)
router.get('/getPostById/:postId',verifyToken,getPostById)
router.post('/createPost',verifyToken,createPost)



export default router