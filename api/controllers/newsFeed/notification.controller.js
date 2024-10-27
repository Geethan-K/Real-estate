import prisma from '../../lib/prisma.js';
import jwt from 'jsonwebtoken';

export const sendNotification = async (req, res) => {
    const { userId, type, postId } = req.body;

    try {
        const notification = await prisma.notification.create({
            data: {
                userId,
                type, // e.g., 'like', 'comment', 'follow'
                postId,
            },
        });

        res.json(notification);
    } catch (error) {
        res.status(500).json({ error: 'Failed to send notification' });
    }
};


export const getUserNotifications = async (req, res) => {
    const { userId } = req.params;

    try {
        const notifications = await prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });

        res.json(notifications);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
};

const markNotificationSeen = async (req, res) => {
    const { notificationId } = req.params;
    try {
        await prisma.notification.update({
            where: { id: notificationId },
            data: { seen: true },
        });
        res.status(200).json({ message: 'Notification marked as seen' });
    } catch (error) {
        res.status(500).json({ message: 'Error marking notification', error });
    }
};
