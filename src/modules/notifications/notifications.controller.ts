import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { NotificationsService } from './notifications.service';

import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';

import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { NotificationResponseDto } from './dto/notification-response.dto';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiParam,
} from '@nestjs/swagger';


@ApiTags('notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
  ) {}

  // CREATE NOTIFICATION
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a notification',
    description:
      'Creates a new notification for the authenticated user',
  })
  @ApiResponse({
    status: 201,
    description: 'Notification created successfully',
    type: NotificationResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request. Validation failed',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. Invalid or expired access token',
  })
  @ApiResponse({
    status: 429,
    description: 'Too Many Requests. Rate limit exceeded',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
  })
  async create(
    @GetUser('id') userId: string,
    @Body() dto: CreateNotificationDto,
  ): Promise<NotificationResponseDto> {
    return await this.notificationsService.create(userId, dto);
  }

  // GET ALL NOTIFICATIONS
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get all notifications',
    description:
      'Returns all notifications for the authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'Notifications retrieved successfully',
    type: [NotificationResponseDto],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. Invalid or expired access token',
  })
  @ApiResponse({
    status: 429,
    description: 'Too Many Requests. Rate limit exceeded',
  })
  async findAll(
    @GetUser('id') userId: string,
  ): Promise<NotificationResponseDto[]> {
    return await this.notificationsService.findAll(userId);
  }

  // UPDATE NOTIFICATION
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update notification',
    description:
      'Updates an existing notification owned by the authenticated user',
  })
  @ApiParam({
    name: 'id',
    description: 'Notification ID',
    example: 100,
  })
  @ApiResponse({
    status: 200,
    description: 'Notification updated successfully',
    type: NotificationResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request. Validation failed',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. Invalid or expired access token',
  })
  @ApiResponse({
    status: 404,
    description: 'Notification not found',
  })
  @ApiResponse({
    status: 429,
    description: 'Too Many Requests. Rate limit exceeded',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @GetUser('id') userId: string,
    @Body() dto: UpdateNotificationDto,
  ): Promise<NotificationResponseDto> {
    return await this.notificationsService.update(
      id,
      userId,
      dto,
    );
  }

  // DELETE NOTIFICATION
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete notification',
    description:
      'Deletes a notification owned by the authenticated user',
  })
  @ApiParam({
    name: 'id',
    description: 'Notification ID',
    example: 100,
  })
  @ApiResponse({
    status: 200,
    description: 'Notification deleted successfully',
    schema: {
      example: {
        message: 'Notification deleted successfully',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. Invalid or expired access token',
  })
  @ApiResponse({
    status: 404,
    description: 'Notification not found',
  })
  @ApiResponse({
    status: 429,
    description: 'Too Many Requests. Rate limit exceeded',
  })
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @GetUser('id') userId: string,
  ): Promise<{ message: string }> {
    return await this.notificationsService.remove(id, userId);
  }
}