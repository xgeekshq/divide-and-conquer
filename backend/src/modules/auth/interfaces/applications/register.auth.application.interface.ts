import CreateGuestUserDto from 'src/modules/users/dto/create.guest.user.dto';
import CreateUserDto from 'src/modules/users/dto/create.user.dto';
import User from 'src/modules/users/entities/user.schema';

export interface RegisterAuthApplication {
	register(registrationData: CreateUserDto): Promise<User>;
	createGuestUser(guestUserData: CreateGuestUserDto): Promise<User>;
}
