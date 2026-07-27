import { EmailNotificationChannel } from './email.channel';

describe('EmailNotificationChannel', () => {
  it('should fail for an invalid email format', async () => {
    const channel = new EmailNotificationChannel();
    const notification = { id: 1, title: 'T', content: 'C' } as any;
    const user = { id: 'u1', email: 'not-an-email' };

    const result = await channel.send(notification, user);

    expect(result.status).toBe('FAILED');
    expect(result.details).toBe('Invalid email recipient format');
  });
});