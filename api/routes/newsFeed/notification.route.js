import express from 'express'
import { verifyToken } from '../../middleware/verifyToken.js'
import {getUserNotifications,sendNotification} from '../../controllers/newsFeed/notification.controller.js'

const router = express.Router()

router.get('/getNotifications/:userId',verifyToken,getUserNotifications)
router.post('/send',verifyToken,sendNotification)


export default router