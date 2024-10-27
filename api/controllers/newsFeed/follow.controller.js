import prisma from '../../lib/prisma.js';
import jwt from 'jsonwebtoken';

export const followUser = async (req, res) => {
    const { followerId, followingId } = req.body;

    try {
        const follow = await prisma.follow.create({
            data: { followerId, followingId },
        });

        res.json(follow);
    } catch (error) {
        res.status(500).json({ error: 'Failed to follow user' });
    }
};

export const unfollowUser = async (req, res) => {
    const { followerId, followingId } = req.body;

    try {
        await prisma.follow.deleteMany({
            where: { followerId, followingId },
        });

        res.json({ message: 'Unfollowed' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to unfollow user' });
    }
};

export const getFollowers = async (req, res) => {
    const { userId } = req.params;
    try {
        const followers = await prisma.follow.findMany({
            where: { followingId: userId },
            include: { follower: true },
        });

        res.json(followers);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch followers' });
    }
};

export const getFollowings = async (req, res) => {
    const { userId } = req.params;

    try {
        const following = await prisma.follow.findMany({
            where: { followerId: userId },
            include: { following: true },
        });

        res.json(following);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch following users' });
    }
};

export const isFollowing = async (req, res) => {
    const { userId, followingId } = req.params;

    try {
        const following = await prisma.follow.findFirst({
            where: { followerId: userId, followingId },
        });

        res.json({ isFollowing: !!following });
    } catch (error) {
        res.status(500).json({ error: 'Failed to check following status' });
    }
};

