import { ApiProperty } from '@nestjs/swagger';
import { Transform, TransformFnParams } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';
import { BaseDto } from './base.dto';

export class TextDto extends BaseDto {
	@ApiProperty()
	@IsNotEmpty()
	@IsString()
	@Transform(({ value }: TransformFnParams) => value.trim())
	text!: string;
}
