import prisma from '../../config/prisma';
import { eventBus } from './event-bus.service';

export class NotificationService {
  public async getNotifications(userId: string) {
    return await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  public async getUnreadCount(userId: string) {
    return await prisma.notification.count({
      where: { userId, isRead: false },
    });
  }

  public async addNotification(
    userId: string,
    type: 'CRITICAL' | 'WARNING' | 'INFO' | 'SUCCESS',
    title: string,
    message: string
  ) {
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
      },
    });

    // Publish event for real-time client consumption
    eventBus.publish(userId, 'notification:added', notification);
    return notification;
  }

  public async markAsRead(userId: string, notificationId: string) {
    await prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { isRead: true },
    });

    eventBus.publish(userId, 'notification:updated', { id: notificationId, isRead: true });
  }

  public async clearAll(userId: string) {
    await prisma.notification.deleteMany({
      where: { userId },
    });

    eventBus.publish(userId, 'notifications:cleared', {});
  }
}
