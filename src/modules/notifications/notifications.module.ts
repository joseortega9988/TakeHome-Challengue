import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { NotificationSenderService } from './notification-sender.service';
import { EmailNotificationChannel } from './channels/email.channel';
import { SmsNotificationChannel } from './channels/sms.channel';
import { PushNotificationChannel } from './channels/push.channel';

@Module({
  imports: [PrismaModule],
  providers: [
    NotificationsService,
    NotificationSenderService,
    EmailNotificationChannel,
    SmsNotificationChannel,
    PushNotificationChannel,
    {
      provide: 'NOTIFICATION_CHANNELS',
      useFactory: (
        emailChannel: EmailNotificationChannel,
        smsChannel: SmsNotificationChannel,
        pushChannel: PushNotificationChannel,
      ) => [emailChannel, smsChannel, pushChannel],
      inject: [
        EmailNotificationChannel,
        SmsNotificationChannel,
        PushNotificationChannel,
      ],
    },
  ],
  controllers: [NotificationsController],
})
export class NotificationsModule {}
