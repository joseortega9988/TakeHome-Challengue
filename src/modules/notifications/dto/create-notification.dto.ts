import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsIn } from 'class-validator';
import { NotificationChannel } from '@prisma/client';

const CHANNELS = ['EMAIL', 'SMS', 'PUSH'] as const;

export class CreateNotificationDto {
  @ApiProperty({ example: 'Service update', description: 'Notification title' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Your booking has been confirmed.', description: 'Notification content' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ example: 'EMAIL', description: 'Notification channel', enum: CHANNELS })
  @IsString()
  @IsIn(CHANNELS)
  channel: NotificationChannel;
}
