import { Body, Controller, Post } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';

@Controller('tasks')
export class TasksController {
    constructor(private readonly taskService:TasksService){}

    @Post()
    async create(@Body() createTaskDto: CreateTaskDto){
        return this.taskService.createTask(createTaskDto);
    }
}
