import { SelectedValues } from '../types';

export interface BaseInterfaceRepository<T> {
	getAll(selectedValues?: SelectedValues<T>): Promise<T[]>;

	get(id: string, selectedValues?: SelectedValues<T>): Promise<T>;

	create(item: T): Promise<T>;

	update(id: string, item: T);

	getByProp(value: any): Promise<T>;

	countDocuments(): Promise<number>;

	findOneByFieldAndUpdate(value: any, query: any): Promise<T>;
}
