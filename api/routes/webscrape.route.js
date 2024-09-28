import express from 'express'
import { verifyToken } from '../middleware/verifyToken.js'
import { scrapeData } from '../controllers/webscrape.controller.js'

const router = express.Router()

router.get('/',scrapeData)
export default router