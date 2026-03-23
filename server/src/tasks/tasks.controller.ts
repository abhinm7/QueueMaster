import { Body, Controller, Get, Param, Post, Request, UseGuards } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('tasks')
@UseGuards(AuthGuard('jwt'))
export class TasksController {
    constructor(private readonly taskService: TasksService) { }

    @Post()
    async create(@Request() req: any, @Body() createTaskDto: CreateTaskDto) {
        return this.taskService.createTask(createTaskDto, req.user.userId);
    }

    @Get(':id')
    async getStatus(@Request() req: any, @Param('id') id: string) {
        return this.taskService.getTaskStatus(id, req.user.userId);
    }

}
