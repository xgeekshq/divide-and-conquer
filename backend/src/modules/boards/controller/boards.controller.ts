import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  NotFoundException,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import BoardDto from '../dto/board.dto';
import JwtAuthenticationGuard from '../../../libs/guards/jwtAuth.guard';
import RequestWithUser from '../../../libs/interfaces/requestWithUser.interface';
import { TYPES } from '../interfaces/types';
import { CreateBoardApplicationInterface } from '../interfaces/applications/create.board.application.interface';
import { GetBoardApplicationInterface } from '../interfaces/applications/get.board.application.interface';
import { DeleteBoardApplicationInterface } from '../interfaces/applications/delete.board.application.interface';
import { UpdateBoardApplicationInterface } from '../interfaces/applications/update.board.application.interface';
import {
  BOARD_NOT_FOUND,
  DELETE_FAILED,
  INSERT_FAILED,
  UPDATE_FAILED,
} from '../../../libs/exceptions/messages';

@Controller('boards')
export default class BoardsController {
  constructor(
    @Inject(TYPES.applications.CreateBoardApplication)
    private createBoardApp: CreateBoardApplicationInterface,
    @Inject(TYPES.applications.GetBoardApplication)
    private getBoardApp: GetBoardApplicationInterface,
    @Inject(TYPES.applications.UpdateBoardApplication)
    private updateBoardApp: UpdateBoardApplicationInterface,
    @Inject(TYPES.applications.DeleteBoardApplication)
    private deleteBoardApp: DeleteBoardApplicationInterface,
  ) {}

  @UseGuards(JwtAuthenticationGuard)
  @Post()
  async createBoard(
    @Req() request: RequestWithUser,
    @Body() boardData: BoardDto,
  ) {
    const board = await this.createBoardApp.create(boardData, request.user._id);
    if (!board) throw new BadRequestException(INSERT_FAILED);

    return board;
  }

  @UseGuards(JwtAuthenticationGuard)
  @Get()
  boards(@Req() request: RequestWithUser) {
    return this.getBoardApp.getAllBoards(request.user._id);
  }

  @UseGuards(JwtAuthenticationGuard)
  @Get(':boardId')
  async getBoard(
    @Param('boardId') boardId: string,
    @Req() request: RequestWithUser,
  ) {
    const board = await this.getBoardApp.getBoard(boardId, request.user._id);
    if (!board) throw new NotFoundException(BOARD_NOT_FOUND);

    return board;
  }

  @UseGuards(JwtAuthenticationGuard)
  @Put(':boardId')
  async updateBoard(
    @Req() request: RequestWithUser,
    @Param('boardId') boardId: string,
    @Body() boardData: BoardDto,
  ) {
    const board = await this.updateBoardApp.update(
      request.user._id,
      boardId,
      boardData,
    );

    if (!board) throw new BadRequestException(UPDATE_FAILED);

    return board;
  }

  @UseGuards(JwtAuthenticationGuard)
  @Delete(':boardId')
  async deleteBoard(
    @Param('boardId') boardId: string,
    @Req() request: RequestWithUser,
  ) {
    const result = await this.deleteBoardApp.delete(boardId, request.user._id);
    if (!result) throw new BadRequestException(DELETE_FAILED);

    return result;
  }
}
