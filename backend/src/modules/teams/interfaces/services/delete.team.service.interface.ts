export interface DeleteTeamServiceInterface {
	// delete doesn't return an object
	delete(teamId: string, userId: string): Promise<boolean>;
}
