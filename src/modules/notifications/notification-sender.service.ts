import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Notification } from '@prisma/client';
import { NotificationChannelSender, NotificationSendResult } from './channels/notification-channel.interface';

@Injectable()
export class NotificationSenderService {
  constructor(
    @Inject('NOTIFICATION_CHANNELS')
    private readonly channels: NotificationChannelSender[],
  ) {}

  async send(notification: Notification, user: { id: string; email: string }): Promise<NotificationSendResult> {
    const sender = this.channels.find((channel) => channel.channel === notification.channel);

    if (!sender) {
      throw new NotFoundException(`Unsupported notification channel: ${notification.channel}`);
    }

    return sender.send(notification, user);
  }
}
