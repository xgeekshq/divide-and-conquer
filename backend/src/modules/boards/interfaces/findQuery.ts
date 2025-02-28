import { Document } from 'mongoose';
import Team from 'src/modules/teams/entities/team.schema';

export type QueryType = {
	$and: (
		| {
				isSubBoard: boolean;
				updatedAt?: {
					$gte: number;
				};
				$or?: undefined;
		  }
		| {
				$or: (
					| {
							_id: {
								$in: Document<unknown>[];
							};
							team?: undefined;
					  }
					| {
							team: {
								$in?: Team[] | string[];
								$ne?: undefined | null;
							};
							_id?: undefined;
					  }
					| {
							team: Team | string;
							_id?: undefined;
					  }
				)[];
				isSubBoard?: undefined;
				updatedAt?: undefined;
		  }
		| {
				_id: {
					$in: Document<unknown>[];
				};
		  }
		| {
				team: string;
		  }
	)[];
};
