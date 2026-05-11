import { Injectable } from '@nestjs/common';
import {
  NotificationChannelSender,
  NotificationNotificationPayload,
  NotificationSendResult,
  NotificationUserPayload,
} from './notification-channel.interface';

@Injectable()
export class EmailNotificationChannel implements NotificationChannelSender {
  channel: 'EMAIL' = 'EMAIL';

  async send(
    notification: NotificationNotificationPayload,
    user: NotificationUserPayload,
  ): Promise<NotificationSendResult> {
    const recipient = user.email;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(recipient)) {
      return {
        status: 'FAILED',
        channel: this.channel,
        details: 'Invalid email recipient format',
      };
    }

    const template = `Subject: ${notification.title}\n\n${notification.content}`;

    console.log('[Email][Send]', {
      recipient,
      templateLength: template.length,
      notificationId: notification.id,
    });

    return {
      status: 'SENT',
      channel: this.channel,
      details: `Email sent to ${recipient} using generated template`,
    };
  }
}
