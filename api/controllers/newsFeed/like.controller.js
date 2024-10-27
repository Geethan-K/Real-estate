import prisma from '../../lib/prisma.js';
import jwt from 'jsonwebtoken';

export const toggleLike = async (req, res) => {
    const { postId, userId } = req.body;
    try {
        const existingLike = await prisma.like.findFirst({
            where: { postId, userId },
        });

        if (existingLike) {
            const removedLike = await prisma.like.delete({
                where: { id: existingLike.id },
            });
            return res.json({ message: 'Like removed',response:removedLike });
        } else {
           const newLike = await prisma.like.create({
                data: { postId, userId },
            });
            return res.json({ message: 'Liked',response:newLike });
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Failed to toggle like' });
    }
};



export const getLikesByPostId = async (req, res) => {
    const { postId } = req.params;

    try {
        const likes = await prisma.like.findMany({
            where: { postId },
            include: { user: true },
        });

        res.json(likes);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch likes' });
    }
};

