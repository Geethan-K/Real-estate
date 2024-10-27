//app.get('/api/post/:postId/shares', getSharesCount);
import prisma from "../../lib/prisma.js";
export const sharePost = async (req, res) => {
    const { postId, userId } = req.body;

    try {
        await prisma.share.create({
            data: { postId, userId },
        });

        const sharesCount = await prisma.share.count({
            where: { postId },
        });

        res.json({ sharesCount });
    } catch (error) {
        res.status(500).json({ error: 'Failed to share post' });
    }
};

export const getSharesCount = async (req, res) => {
    const { postId } = req.params;

    try {
        const sharesCount = await prisma.share.count({
            where: { postId },
        });

        res.json({ sharesCount });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch share count' });
    }
};
