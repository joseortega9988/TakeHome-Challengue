import request from 'supertest';
import { createTestApp } from './helpers';
import nock from 'nock';

describe('Notifications (e2e)', () => {
  let app: any;
  let prisma: any;
  let accessToken: string;

  beforeAll(async () => {
    // Notification channels only console.log and return a result object —
    // no real network calls — so this is purely a safety net.
    nock.disableNetConnect();
    nock.enableNetConnect('127.0.0.1');

    const res = await createTestApp();
    app = res.app;
    prisma = res.prisma;
  });

  afterAll(async () => {
    await app.close();
    nock.cleanAll();
    nock.enableNetConnect();
  });

  beforeEach(async () => {
    await prisma.cleanDatabase();

    const registerRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'notif_user@example.com',
        password: 'Password1@',
        firstName: 'Notif',
        lastName: 'User',
      })
      .expect(201);

    accessToken = registerRes.body.accessToken;
  });

  const auth = () => `Bearer ${accessToken}`;

  describe('POST /notifications', () => {
    it('should create and send an EMAIL notification', async () => {
      const res = await request(app.getHttpServer())
        .post('/notifications')
        .set('Authorization', auth())
        .send({ title: 'Welcome', content: 'Hello there', channel: 'EMAIL' })
        .expect(201);

      expect(res.body.channel).toBe('EMAIL');
      expect(res.body.sendResult.status).toBe('SENT');
    });

    it('should create and send a PUSH notification', async () => {
      const res = await request(app.getHttpServer())
        .post('/notifications')
        .set('Authorization', auth())
        .send({ title: 'Update', content: 'Check this out', channel: 'PUSH' })
        .expect(201);

      expect(res.body.channel).toBe('PUSH');
      expect(res.body.sendResult.status).toBe('SENT');
    });

    it('should create and send an SMS notification', async () => {
      const res = await request(app.getHttpServer())
        .post('/notifications')
        .set('Authorization', auth())
        .send({ title: 'Reminder', content: 'Short text', channel: 'SMS' })
        .expect(201);

      expect(res.body.channel).toBe('SMS');
      expect(res.body.sendResult.status).toBe('SENT');
    });

    it('should reject SMS content over 160 characters', async () => {
      await request(app.getHttpServer())
        .post('/notifications')
        .set('Authorization', auth())
        .send({ title: 'Too long', content: 'x'.repeat(161), channel: 'SMS' })
        .expect(400);
    });

    it('should reject creation without an access token', async () => {
      await request(app.getHttpServer())
        .post('/notifications')
        .send({ title: 'No auth', content: 'Should fail', channel: 'EMAIL' })
        .expect(401);
    });
  });

  describe('GET /notifications', () => {
    it("should return only the authenticated user's notifications", async () => {
      await request(app.getHttpServer())
        .post('/notifications')
        .set('Authorization', auth())
        .send({ title: 'First', content: 'One', channel: 'EMAIL' })
        .expect(201);

      await request(app.getHttpServer())
        .post('/notifications')
        .set('Authorization', auth())
        .send({ title: 'Second', content: 'Two', channel: 'PUSH' })
        .expect(201);

      const res = await request(app.getHttpServer())
        .get('/notifications')
        .set('Authorization', auth())
        .expect(200);

      expect(res.body).toHaveLength(2);
    });
  });

  describe('PATCH /notifications/:id', () => {
    it('should update a notification owned by the user', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/notifications')
        .set('Authorization', auth())
        .send({ title: 'Original', content: 'Body', channel: 'EMAIL' })
        .expect(201);

      const updateRes = await request(app.getHttpServer())
        .patch(`/notifications/${createRes.body.id}`)
        .set('Authorization', auth())
        .send({ title: 'Updated title' })
        .expect(200);

      expect(updateRes.body.title).toBe('Updated title');
      expect(updateRes.body.content).toBe('Body');
    });

    it('should 404 when updating a notification that does not exist', async () => {
      await request(app.getHttpServer())
        .patch('/notifications/999999')
        .set('Authorization', auth())
        .send({ title: 'Does not matter' })
        .expect(404);
    });

    it('should 404 when updating a notification owned by another user', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/notifications')
        .set('Authorization', auth())
        .send({ title: 'Mine', content: 'Body', channel: 'EMAIL' })
        .expect(201);

      const otherRes = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'other_user@example.com',
          password: 'Password1@',
          firstName: 'Other',
          lastName: 'User',
        })
        .expect(201);

      await request(app.getHttpServer())
        .patch(`/notifications/${createRes.body.id}`)
        .set('Authorization', `Bearer ${otherRes.body.accessToken}`)
        .send({ title: 'Hijacked' })
        .expect(404);
    });
  });

  describe('DELETE /notifications/:id', () => {
    it('should delete a notification owned by the user', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/notifications')
        .set('Authorization', auth())
        .send({ title: 'To delete', content: 'Body', channel: 'EMAIL' })
        .expect(201);

      const deleteRes = await request(app.getHttpServer())
        .delete(`/notifications/${createRes.body.id}`)
        .set('Authorization', auth())
        .expect(200);

      expect(deleteRes.body.message).toBe('Notification deleted successfully');

      const listRes = await request(app.getHttpServer())
        .get('/notifications')
        .set('Authorization', auth())
        .expect(200);

      expect(listRes.body).toHaveLength(0);
    });

    it('should 404 when deleting a notification that does not exist', async () => {
      await request(app.getHttpServer())
        .delete('/notifications/999999')
        .set('Authorization', auth())
        .expect(404);
    });
  });
});