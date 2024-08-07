import { connect } from 'mongoose';
import prisma from '../lib/prisma.js';
import jwt from 'jsonwebtoken';

export const create = async (req,res) =>{
    const hotelId = req.params.hotelId
    const {roomNo,unavailableDates} = req.body
    try{
        const newRoomBooked = await prisma.roomBooking.create({
            data:{
                ...body.postData,
                hotelId,
                hotelBooking:{
                    connect:{id:hotelId}
                },
                roomNumber:roomNo,
                unavailableDates:{
                    create: unavailableDates
                }
            }
        }).catch((err)=>{
            console.log(err)
        })

        try{
            const hotel = await prisma.hotel.update({
                where:{hotelId},
                data:{
                    rooms:{
                        push:newRoomBooked.id 
                    }
                }
            })
        }catch(err){
            console.log(err)

        }
        res.status(200).json(newPost) 
    }catch(err){
        console.log(err)
        res.status(500).json({message:'Failed to create a new room'})
    }
}