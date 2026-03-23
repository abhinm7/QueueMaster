import { IsNotEmpty, IsObject } from "class-validator";

export class CreateTable{
    @IsObject()
    @IsNotEmpty()
    payload!: Record<string, any>;
}