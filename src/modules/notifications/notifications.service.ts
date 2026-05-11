import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { NotificationSenderService } from './notification-sender.service';

@Injectable()
export class NotificationsService {
  constructor(
    private prisma: PrismaService,
    private notificationSender: NotificationSenderService,
  ) {}

  async create(userId: string, dto: CreateNotificationDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    this.validateNotificationPayload(dto);

    const notification = await this.prisma.notification.create({
      data: {
        title: dto.title,
        content: dto.content,
        channel: dto.channel,
        userId,
      },
      select: {
        id: true,
        title: true,
        content: true,
        channel: true,
        userId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const sendResult = await this.notificationSender.send(notification, user);

    if (sendResult.status === 'FAILED') {
      await this.prisma.notification.delete({ where: { id: notification.id } });
      throw new BadRequestException(`Notification failed: ${sendResult.details}`);
    }

    return {
      ...notification,
      sendResult,
    };
  }

  private validateNotificationPayload(dto: CreateNotificationDto) {
    if (dto.channel === 'SMS' && dto.content.length > 160) {
      throw new BadRequestException(
        'SMS content must be 160 characters or less',
      );
    }
  }

  async findAll(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        content: true,
        channel: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async update(id: number, userId: string, dto: UpdateNotificationDto) {
    const notification = await this.getOwnedNotification(id, userId);

    return this.prisma.notification.update({
      where: { id },
      data: {
        title: dto.title ?? notification.title,
        content: dto.content ?? notification.content,
        channel: dto.channel ?? notification.channel,
      },
      select: {
        id: true,
        title: true,
        content: true,
        channel: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async remove(id: number, userId: string) {
    await this.getOwnedNotification(id, userId);
    await this.prisma.notification.delete({ where: { id } });
    return { message: 'Notification deleted successfully' };
  }

  private async getOwnedNotification(id: number, userId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        content: true,
        channel: true,
        userId: true,
      },
    });

    if (!notification || notification.userId !== userId) {
      throw new NotFoundException('Notification not found');
    }

    return notification;
  }
}
