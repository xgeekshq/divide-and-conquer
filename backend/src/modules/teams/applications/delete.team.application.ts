import { Inject, Injectable } from '@nestjs/common';
import { DeleteTeamApplicationInterface } from '../interfaces/applications/delete.team.application.interface';
import { DELETE_TEAM_SERVICE } from '../constants';

@Injectable()
export class DeleteTeamApplication implements DeleteTeamApplicationInterface {
	constructor(
		@Inject(DELETE_TEAM_SERVICE)
		private deleteTeamServices: DeleteTeamApplicationInterface
	) {}

	delete(teamId: string) {
		return this.deleteTeamServices.delete(teamId);
	}
}
