import express from 'express'
import { verifyToken } from '../../middleware/verifyToken.js'
import {getPosts,getUserPosts,getPostById,createPost , signUpload , signDownload} from '../../controllers/newsFeed/newsfeed.controller.js'

const router = express.Router()

router.get('/getPosts/:userId',verifyToken,getPosts)
router.get('/getUserPosts/:userId',verifyToken,getUserPosts)
router.get('/getPostById/:postId',verifyToken,getPostById)
router.post('/createPost',verifyToken,createPost)

router.post('/b2/sign-upload' , verifyToken , signUpload)
router.post('/b2/sign-download' , verifyToken , signDownload)

export default router