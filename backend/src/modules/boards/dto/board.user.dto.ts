import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
	IsBoolean,
	IsEnum,
	IsMongoId,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsString
} from 'class-validator';
import { BoardRoles } from 'src/libs/enum/board.roles';

export default class BoardUserDto {
	@ApiPropertyOptional()
	@IsOptional()
	@IsMongoId()
	_id?: string;

	@ApiProperty({ type: String, enum: BoardRoles, enumName: 'Roles' })
	@IsString()
	@IsNotEmpty()
	@IsEnum(BoardRoles, { each: true })
	role!: string;

	@ApiProperty()
	@IsMongoId()
	@IsString()
	@IsNotEmpty()
	user!: string;

	@ApiPropertyOptional({ default: 0 })
	@IsOptional()
	@IsNumber()
	votesCount?: number;

	@ApiPropertyOptional()
	@IsOptional()
	@IsBoolean()
	isNewJoiner?: boolean;
}
