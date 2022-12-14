import { Inject, Injectable } from '@nestjs/common';
import UpdateUserDto from '../dto/update.user.dto';
import UserDto from '../dto/user.dto';
import { UpdateUserApplication } from '../interfaces/applications/update.user.service.interface';
import { UpdateUserService } from '../interfaces/services/update.user.service.interface';
import { TYPES } from '../interfaces/types';

@Injectable()
export class UpdateUserApplicationImpl implements UpdateUserApplication {
	constructor(
		@Inject(TYPES.services.UpdateUserService)
		private updateUserService: UpdateUserService
	) {}

	setCurrentRefreshToken(refreshToken: string, userId: string) {
		return this.updateUserService.setCurrentRefreshToken(refreshToken, userId);
	}

	setPassword(userEmail: string, newPassword: string, newPasswordConf: string) {
		return this.updateUserService.setPassword(userEmail, newPassword, newPasswordConf);
	}

	checkEmail(token: string) {
		return this.updateUserService.checkEmail(token);
	}

	updateSuperAdmin(user: UpdateUserDto, requestUser: UserDto) {
		return this.updateUserService.updateSuperAdmin(user, requestUser);
	}
}
