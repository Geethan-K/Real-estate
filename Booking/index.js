import express from 'express'
import mongoose, { connect } from 'mongoose'
import dotenv from 'dotenv' 
const app = express()
dotenv.config()

const Connect = async () =>{
    try{
        await mongoose.connect(process.env.DATABASE_URL);
        console.log('CONNETED TO MONGODB')
    }catch(err){
        handleError(err)
    }
}

mongoose.connection.on('disconnected',()=>{
    console.log('mongoDB disconnected !')
})
mongoose.connection.on('connected',()=>{
    console.log('mongoDB connected !')
})

app.listen(5000,()=>{
    Connect()
    console.log('app is litening on port 4000')
})