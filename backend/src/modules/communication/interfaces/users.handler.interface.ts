import { ProfileType } from 'modules/communication/dto/types';

export interface UsersHandlerInterface {
	getProfilesByIds(usersIds: string[]): Promise<ProfileType[]>;
	getSlackUserIdByEmail(email: string): Promise<string>;
}
