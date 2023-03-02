import { ClientSession, FilterQuery, Model, QueryOptions, UpdateQuery } from 'mongoose';
import {
	BaseInterfaceRepository,
	PopulateType,
	SortType
} from '../interfaces/base.repository.interface';
import { ModelProps, SelectedValues } from '../types';

export class MongoGenericRepository<T> implements BaseInterfaceRepository<T> {
	protected _repository: Model<T>;
	protected _session: ClientSession;

	constructor(repository: Model<T>) {
		this._repository = repository;
	}

	countDocuments(): Promise<number> {
		return this._repository.countDocuments().lean().exec();
	}

	findAll(
		selectedValues?: SelectedValues<T>,
		sort?: SortType,
		populate?: PopulateType
	): Promise<T[]> {
		return this._repository.find().select(selectedValues).sort(sort).populate(populate).exec();
	}

	findOneById(id: any, selectedValues?: SelectedValues<T>, populate?: PopulateType): Promise<T> {
		return this._repository
			.findById(id)
			.select(selectedValues)
			.populate(populate)
			.lean({ virtuals: true })
			.exec() as Promise<T>;
	}

	findOneByField(value: ModelProps<T>): Promise<T> {
		return this._repository.findOne(value).exec();
	}

	findOneByFieldWithQuery(
		value: FilterQuery<T>,
		selectedValues?: SelectedValues<T>,
		populate?: PopulateType
	): Promise<T> {
		return this._repository
			.findOne(value)
			.select(selectedValues)
			.populate(populate)
			.exec() as Promise<T>;
	}

	findAllWithQuery(
		query: FilterQuery<T>,
		selectedValues?: SelectedValues<T>,
		populate?: PopulateType,
		virtuals = true
	): Promise<T[]> {
		return this._repository
			.find(query)
			.select(selectedValues)
			.populate(populate)
			.lean({ virtuals: virtuals })
			.exec() as unknown as Promise<T[]>;
	}

	create(item: T): Promise<T> {
		return this._repository.create(item);
	}

	insertMany(listOfItems: T[]): Promise<T[]> {
		return this._repository.insertMany(listOfItems);
	}

	update(id: string, item: T): Promise<T> {
		return this._repository.findByIdAndUpdate(id, item).exec();
	}

	findOneByFieldAndUpdate(
		value: FilterQuery<T>,
		query: UpdateQuery<T>,
		options?: QueryOptions<T>,
		populate?: PopulateType
	): Promise<T> {
		return this._repository
			.findOneAndUpdate(value, query, options)
			.populate(populate)
			.lean()
			.exec() as unknown as Promise<T>;
	}

	findOneAndRemove(id: string, withSession = false): Promise<T> {
		return this._repository
			.findOneAndRemove(
				{
					_id: id
				},
				{ session: withSession ? this._session : undefined }
			)
			.exec();
	}

	findOneAndRemoveByField(fields: ModelProps<T>, withSession: boolean): Promise<T> {
		return this._repository
			.findOneAndRemove(fields, {
				session: withSession ? this._session : undefined
			})
			.exec();
	}

	findByIdAndDelete(id: string, withSession: boolean): Promise<T> {
		return this._repository
			.findByIdAndDelete(id, {
				session: withSession ? this._session : undefined
			})
			.exec();
	}

	async deleteMany(field: FilterQuery<T>, withSession = false): Promise<number> {
		const { deletedCount } = await this._repository
			.deleteMany(field, { session: withSession ? this._session : undefined })
			.exec();

		return deletedCount;
	}

	async startTransaction() {
		this._session = await this._repository.db.startSession();
		this._session.startTransaction();
	}

	async commitTransaction() {
		await this._session.commitTransaction();
	}

	async abortTransaction() {
		await this._session.abortTransaction();
	}

	async endSession() {
		await this._session.endSession();
	}
}
