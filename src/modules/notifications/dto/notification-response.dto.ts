// notification-response.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import { NotificationChannel } from '@prisma/client';

export class NotificationResponseDto {
  @ApiProperty({
    example: 100,
  })
  id: number;

  @ApiProperty({
    example: 'Welcome Notification',
  })
  title: string;

  @ApiProperty({
    example: 'Welcome to the platform',
  })
  content: string;

  @ApiProperty({
    enum: NotificationChannel,
    example: 'EMAIL',
  })
  channel: NotificationChannel;

  @ApiProperty({
    example: '2026-05-11T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2026-05-11T00:00:00.000Z',
  })
  updatedAt: Date;
}