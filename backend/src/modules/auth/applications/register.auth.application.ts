import CreateGuestUserDto from 'src/modules/users/dto/create.guest.user.dto';
import { Inject, Injectable } from '@nestjs/common';
import CreateUserDto from 'src/modules/users/dto/create.user.dto';
import { RegisterAuthApplication } from '../interfaces/applications/register.auth.application.interface';
import { RegisterAuthService } from '../interfaces/services/register.auth.service.interface';
import { TYPES } from '../interfaces/types';

@Injectable()
export class RegisterAuthApplicationImpl implements RegisterAuthApplication {
	constructor(
		@Inject(TYPES.services.RegisterAuthService)
		private registerAuthService: RegisterAuthService
	) {}

	register(registrationData: CreateUserDto) {
		return this.registerAuthService.register(registrationData);
	}

	createGuestUser(guestUserData: CreateGuestUserDto) {
		if (guestUserData.user) return this.registerAuthService.loginGuest(guestUserData);

		return this.registerAuthService.createGuest(guestUserData);
	}
}
