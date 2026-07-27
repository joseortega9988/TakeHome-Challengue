import { SmsNotificationChannel } from './sms.channel';

describe('SmsNotificationChannel', () => {
  it('should fail when content exceeds 160 characters', async () => {
    const channel = new SmsNotificationChannel();
    const notification = { id: 1, title: 'T', content: 'x'.repeat(161) } as any;
    const user = { id: 'u1' };

    const result = await channel.send(notification, user);

    expect(result.status).toBe('FAILED');
    expect(result.details).toBe('SMS content exceeds 160 characters');
  });
});