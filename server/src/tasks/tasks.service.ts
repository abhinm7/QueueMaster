import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task, TaskStatus } from './entities/task.entity';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { CreateTaskDto } from './dto/create-task.dto';
import { stat } from 'fs';

@Injectable()
export class TasksService {
    constructor(
        @InjectRepository(Task)
        private readonly taskRepository: Repository<Task>,
        @InjectQueue('task-queue')
        private readonly taskQueue: Queue) { }

    async createTask(CreateTaskDto: CreateTaskDto) {
        // persist to postgres
        const task = this.taskRepository.create({
            payload: CreateTaskDto.payload,
            status: TaskStatus.PENDING,
        });
        const savedTask = await this.taskRepository.save(task);

        // push to redis queue
        await this.taskQueue.add('process-task', { taskId: savedTask.id });

        // acknowlegdge to client
        return { taskId: savedTask.id, status: savedTask.status };

    }

}
