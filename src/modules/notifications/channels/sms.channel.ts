import { Injectable } from '@nestjs/common';
import {
  NotificationChannelSender,
  NotificationNotificationPayload,
  NotificationSendResult,
  NotificationUserPayload,
} from './notification-channel.interface';

@Injectable()
export class SmsNotificationChannel implements NotificationChannelSender {
  channel: 'SMS' = 'SMS';

  async send(
    notification: NotificationNotificationPayload,
    user: NotificationUserPayload,
  ): Promise<NotificationSendResult> {
    const recipientNumber = '+1234567890';
    const maxLength = 160;

    if (notification.content.length > maxLength) {
      return {
        status: 'FAILED',
        channel: this.channel,
        details: `SMS content exceeds ${maxLength} characters`,
      };
    }

    const sentAt = new Date().toISOString();

    console.log('[SMS][Send]', {
      recipientNumber,
      sentAt,
      notificationId: notification.id,
    });

    return {
      status: 'SENT',
      channel: this.channel,
      details: `SMS sent to ${recipientNumber} at ${sentAt}`,
    };
  }
}
