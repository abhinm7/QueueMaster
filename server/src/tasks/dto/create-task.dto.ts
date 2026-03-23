import { IsNotEmpty, IsObject } from "class-validator";

export class CreateTaskDto{
    @IsObject()
    @IsNotEmpty()
    payload!: Record<string, any>;
}