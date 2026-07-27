import { PushNotificationChannel } from './push.channel';

describe('PushNotificationChannel', () => {
  it('should fail when the derived device token has invalid characters', async () => {
    const channel = new PushNotificationChannel();
    const notification = { id: 1, title: 'T', content: 'C' } as any;
    const user = { id: 'u@1' };

    const result = await channel.send(notification, user);

    expect(result.status).toBe('FAILED');
    expect(result.details).toBe('Invalid device token format');
  });
});