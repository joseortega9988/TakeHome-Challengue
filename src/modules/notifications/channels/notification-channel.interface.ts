import { NotificationChannel } from '@prisma/client';

export type NotificationChannelType = NotificationChannel;

export interface NotificationNotificationPayload {
  id: number;
  title: string;
  content: string;
  channel: NotificationChannel;
  userId: string;
}

export interface NotificationUserPayload {
  id: string;
  email: string;
}

export interface NotificationSendResult {
  status: 'SENT' | 'FAILED';
  channel: NotificationChannelType;
  details: string;
}

export interface NotificationChannelSender {
  channel: NotificationChannelType;
  send(
    notification: NotificationNotificationPayload,
    user: NotificationUserPayload,
  ): Promise<NotificationSendResult>;
}
