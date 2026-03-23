import { Body, Controller, Get, Param, Post, Query, Request, UseGuards } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetTasksFilterDto } from './dto/get-task-filter.dto';

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

    @Get()
    async getAllTasks(
        @Request() req: any,
        @Query() filterDto: GetTasksFilterDto,
    ) {
        return this.taskService.getUserTasks(req.user.userId, filterDto);
    }

}
