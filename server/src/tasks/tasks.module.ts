import { Module } from '@nestjs/common';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { Task } from './entities/task.entity';
import { TaskProcessor } from './task.processor';

@Module({
  imports: [
    TypeOrmModule.forFeature([Task]),
    BullModule.registerQueue({
      name: 'task-queue',
    }),
  ],
  controllers: [TasksController], 
  providers: [TasksService, TaskProcessor],
})
export class TasksModule { }
