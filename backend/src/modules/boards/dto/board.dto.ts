import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, TransformFnParams, Type } from 'class-transformer';
import {
	ArrayMinSize,
	ArrayNotEmpty,
	IsBoolean,
	IsMongoId,
	IsNotEmpty,
	IsOptional,
	IsString,
	Validate,
	ValidateNested
} from 'class-validator';

import { CheckUniqueUsers } from 'libs/validators/check-unique-users';

import BoardUserDto from './board.user.dto';
import ColumnDto from './column/column.dto';
import DividedBoardDto from './divided-board.dto';

export default class BoardDto {
	@ApiPropertyOptional()
	@IsOptional()
	@IsMongoId()
	_id?: string;

	@ApiProperty()
	@IsString()
	@IsNotEmpty()
	@Transform(({ value }: TransformFnParams) => value.trim())
	title!: string;

	@ApiProperty({ type: ColumnDto, isArray: true })
	@ArrayNotEmpty()
	@ArrayMinSize(3)
	@IsNotEmpty()
	@ValidateNested({ each: true })
	@Type(() => ColumnDto)
	columns!: ColumnDto[];

	@ApiProperty({ default: false })
	@IsNotEmpty()
	@IsBoolean()
	isPublic!: boolean;

	@ApiPropertyOptional()
	@IsNotEmpty()
	@IsString()
	@IsOptional()
	maxVotes?: string | null;

	@ApiPropertyOptional()
	@IsNotEmpty()
	@IsString()
	@IsOptional()
	maxUsers?: string | null;

	@ApiPropertyOptional()
	@IsNotEmpty()
	@IsString()
	@IsOptional()
	maxTeams?: string | null;

	@ApiProperty()
	@IsNotEmpty()
	@IsBoolean()
	hideCards!: boolean;

	@ApiProperty()
	@IsNotEmpty()
	@IsBoolean()
	hideVotes!: boolean;

	@ApiProperty()
	@IsNotEmpty()
	@IsBoolean()
	postAnonymously!: boolean;

	@ApiProperty({ type: DividedBoardDto, isArray: true })
	@IsOptional()
	@ValidateNested({ each: true })
	dividedBoards!: BoardDto[];

	@ApiPropertyOptional()
	@IsOptional()
	@IsMongoId()
	@IsString()
	team?: string | null;

	@ApiPropertyOptional()
	@IsOptional()
	socketId?: string;

	@ApiPropertyOptional({ type: BoardUserDto, isArray: true })
	@IsOptional()
	@Validate(CheckUniqueUsers)
	users!: BoardUserDto[];

	@ApiPropertyOptional()
	@IsNotEmpty()
	@IsBoolean()
	recurrent?: boolean;

	@ApiPropertyOptional({ default: false })
	@IsNotEmpty()
	@IsBoolean()
	isSubBoard?: boolean;
}
