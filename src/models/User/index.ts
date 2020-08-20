import db from '../../database/dbConfig';
import { NewUserArgs, SafeUserResponse, FullUserResponse } from './types';
export * as userValidator from './validate';

export const create = async (user: NewUserArgs): Promise<FullUserResponse> => {
    const [created] = await db('users').returning('*').insert(user);

    return created;
};

export const findById = async (id: number): Promise<FullUserResponse | undefined> => {
    return await db('users').where({ id }).first();
};

export const findByUsername = async (username: string): Promise<FullUserResponse | undefined> => {
    return await db('users').where({ username }).first();
};

export const getAll = async (limit: number = 100): Promise<SafeUserResponse[]> => {
    return await db('users')
        .select('id', 'username', 'email', 'createdAt', 'updatedAt', 'deletedAt', 'isDeleted')
        .limit(limit);
};

export default {
    create,
    findById,
    findByUsername,
    getAll,
};
