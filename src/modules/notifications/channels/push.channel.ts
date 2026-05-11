import { Injectable } from '@nestjs/common';
import {
  NotificationChannelSender,
  NotificationNotificationPayload,
  NotificationSendResult,
  NotificationUserPayload,
} from './notification-channel.interface';

@Injectable()
export class PushNotificationChannel implements NotificationChannelSender {
  channel: 'PUSH' = 'PUSH';

  async send(
    notification: NotificationNotificationPayload,
    user: NotificationUserPayload,
  ): Promise<NotificationSendResult> {
    const deviceToken = `device-token-${user.id}`;
    const tokenRegex = /^[A-Za-z0-9_-]{10,}$/;

    if (!tokenRegex.test(deviceToken)) {
      return {
        status: 'FAILED',
        channel: this.channel,
        details: 'Invalid device token format',
      };
    }

    const payload = {
      title: notification.title,
      body: notification.content,
      userId: user.id,
    };

    console.log('[Push][Send]', {
      deviceToken,
      payload,
      notificationId: notification.id,
    });

    return {
      status: 'SENT',
      channel: this.channel,
      details: `Push notification queued for device token ${deviceToken}`,
    };
  }
}
