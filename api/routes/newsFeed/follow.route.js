import express from 'express'
import { verifyToken } from '../../middleware/verifyToken.js'
import {followUser,isFollowing,getFollowers,getFollowings,unfollowUser} from '../../controllers/newsFeed/follow.controller.js'

const router = express.Router()

router.post('/followUser',verifyToken,followUser)
router.post('/unfollowUser',verifyToken,unfollowUser)
router.get('user/:userId/isFollowing/:followingId',verifyToken,isFollowing)
router.get('user/:userId/getFollowers',verifyToken,getFollowers)
router.get('user/:userId/getFollowings',verifyToken,getFollowings)


export default router