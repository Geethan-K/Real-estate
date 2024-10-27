import prisma from '../../lib/prisma.js';
import jwt from 'jsonwebtoken';

export const addComment = async (req, res) => {
    const { postId,  text } = req.body;
    const userId = req.userId
    try {
        const comment = await prisma.comment.create({
            data: {
                postId,
                userId,
                text,
            },
        });
        res.status(201).json(comment);
    } catch (error) {
        res.status(500).json({ error: 'Failed to add comment' });
    }
};



export const getCommentsByPostId = async (req, res) => {
    const { postId } = req.params;

    try {
        const comments = await prisma.comment.findMany({
            where: { postId },
            include: { user: true },
            orderBy: { createdAt: 'asc' },
        });

        res.json(comments);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch comments' });
    }
};

