import { Inject, Injectable } from '@nestjs/common';
import { LeanDocument } from 'mongoose';
import { UserDocument } from '../entities/user.schema';
import { GetUserApplication } from '../interfaces/applications/get.user.application.interface';
import { GetUserService } from '../interfaces/services/get.user.service.interface';
import { TYPES } from '../interfaces/types';

@Injectable()
export class GetUserApplicationImpl implements GetUserApplication {
	constructor(
		@Inject(TYPES.services.GetUserService)
		private getUserService: GetUserService
	) {}
	getById(id: string): Promise<LeanDocument<UserDocument>> {
		return this.getUserService.getById(id);
	}

	getByEmail(email: string) {
		return this.getUserService.getByEmail(email);
	}

	countUsers() {
		return this.getUserService.countUsers();
	}

	getAllUsers() {
		return this.getUserService.getAllUsers();
	}

	getAllUsersWithPagination(page: number, size: number) {
		return this.getUserService.getAllUsersWithPagination(page, size);
	}

	getAllUsersWithTeams(page?: number, size?: number, searchUser?: string) {
		return this.getUserService.getAllUsersWithTeams(page, size, searchUser);
	}
}
