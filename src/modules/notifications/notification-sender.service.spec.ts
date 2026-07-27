import { NotFoundException } from '@nestjs/common';
import { NotificationSenderService } from './notification-sender.service';
import { NotificationChannelSender } from './channels/notification-channel.interface';

describe('NotificationSenderService', () => {
  // 1. We optionally type this mock using your interface to ensure it matches
  const emailChannel: NotificationChannelSender = {
    channel: 'EMAIL' as any, // Cast to any or your Prisma enum if needed
    send: jest.fn().mockResolvedValue({ status: 'SENT', channel: 'EMAIL', details: 'ok' }),
  };

  it('should throw when no channel matches the notification', async () => {
    // 2. Instantiate the actual Service class, passing the mock channels
    const service = new NotificationSenderService([emailChannel]);
    
    const notification = { id: 2, channel: 'FAX' } as any;
    const user = { id: 'u1', email: 'a@b.com' };

    await expect(service.send(notification, user)).rejects.toThrow(NotFoundException);
  });
});