import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Task, TaskStatus } from "./entities/task.entity";
import { Repository } from "typeorm";
import { Job } from "bullmq";

@Processor('task-queue')
export class TaskProcessor extends WorkerHost {
    private readonly logger = new Logger(TaskProcessor.name);

    constructor(
        @InjectRepository(Task)
        private readonly TaskRepository: Repository<Task>,
    ) {
        super();
    }

    async process(job: Job<{ taskId: string }>): Promise<any> {
        const { taskId } = job.data;
        this.logger.log(`Worker picked up task: ${taskId}`);

        const task = await this.TaskRepository.findOne({ where: { id: taskId } });
        if (!task) {
            this.logger.error(`Ghost job detected. task ${taskId} not found`)
            return
        }

        try {
            // change status immediatly after process start
            task.status = TaskStatus.PROCESSING;
            await this.TaskRepository.save(task);

            // stimulate a heavy task
            const executionTime = Math.floor(Math.random() * 5000) + 3000; // 3 to 8 seconds
            await new Promise((resolve) => setTimeout(resolve, executionTime));

            // update status into completed
            task.status = TaskStatus.COMPELTED;
            task.result = `Successfully processed payload in ${executionTime}ms`;
            await this.TaskRepository.save(task);

            this.logger.log(`Task ${taskId} COMPLETED`);
        } catch (error: any) {
            task.status = TaskStatus.FAILED;
            task.result = `Failed ${error.message}`

            // save the failed tasks
            await this.TaskRepository.save(task);
            this.logger.error(`Task ${taskId} FAILED`, error.stack);

            throw error;
        }
    }
}