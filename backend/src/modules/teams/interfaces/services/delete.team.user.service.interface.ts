import TeamUser from '../../entities/team.user.schema';

export interface DeleteTeamUserServiceInterface {
	// delete doesn't return an object
	delete(userId: string): Promise<boolean>;
	deleteTeamOfUser(userId: string, teamId: string, withSession: boolean): Promise<TeamUser>;
}
