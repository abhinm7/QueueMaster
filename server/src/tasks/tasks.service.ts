import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task, TaskStatus } from './entities/task.entity';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { CreateTaskDto } from './dto/create-task.dto';
import { GetTasksFilterDto } from './dto/get-task-filter.dto';

@Injectable()
export class TasksService {
    constructor(
        @InjectRepository(Task)
        private readonly taskRepository: Repository<Task>,
        @InjectQueue('task-queue')
        private readonly taskQueue: Queue) { }

    async createTask(CreateTaskDto: CreateTaskDto, userId: string) {
        // persist to postgres
        const task = this.taskRepository.create({
            payload: CreateTaskDto.payload,
            status: TaskStatus.PENDING,
            user: { id: userId }
        });
        const savedTask = await this.taskRepository.save(task);

        // push to redis queue
        await this.taskQueue.add('process-task', { taskId: savedTask.id });

        // acknowlegdge to client
        return { taskId: savedTask.id, status: savedTask.status };

    }

    async getTaskStatus(id: string, userId: string) {
        const task = await this.taskRepository.findOne({ where: { id, user: { id: userId } } });
        if (!task) throw new NotFoundException('Task not found');

        return { taskId: task.id, status: task.status, result: task.result };
    }

    async getUserTasks(userId: string, filterDto: GetTasksFilterDto) {
        const { page = 1, limit = 10 } = filterDto;
        const skip = (page - 1) * limit;

        const [tasks, total] = await this.taskRepository.findAndCount({
            where: { user: { id: userId } },
            order: { createdAt: 'DESC' },
            skip,
            take: limit,
        });

        return {
            data: tasks.map(t => ({
                taskId: t.id,
                status: t.status,
                result: t.result,
                createdAt: t.createdAt,
            })),
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        }
    }
}
