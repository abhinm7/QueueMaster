import { IsIn, IsNotEmpty, IsObject, IsString } from "class-validator";

const ALLOWED_TASK_TYPES = ['report', 'export', 'import'];

export class CreateTaskDto {
    @IsString()
    @IsNotEmpty()
    @IsIn(ALLOWED_TASK_TYPES, {
        message: `type must be one of the following values: ${ALLOWED_TASK_TYPES.join(', ')}`
    })
    type!: string;

    @IsObject()
    @IsNotEmpty()
    payload!: Record<string, any>;
}