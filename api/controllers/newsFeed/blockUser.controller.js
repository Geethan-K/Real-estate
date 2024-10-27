import prisma from "../../lib/prisma.js";

export const blockUser = async (req, res) => {
    const { blockerId, blockedId } = req.body;

    try {
        const block = await prisma.block.create({
            data: { blockerId, blockedId },
        });

        res.json(block);
    } catch (error) {
        res.status(500).json({ error: 'Failed to block user' });
    }
};

//app.get('/api/user/:userId/blocked', getBlockedUsers);

export const getBlockedUsers = async (req, res) => {
    const { userId } = req.params;

    try {
        const blockedUsers = await prisma.block.findMany({
            where: { blockerId: userId },
            include: { blocked: true },
        });

        res.json(blockedUsers);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch blocked users' });
    }
};

