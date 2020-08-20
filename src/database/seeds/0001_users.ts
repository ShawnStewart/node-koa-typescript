import * as Knex from 'knex';

export async function seed(knex: Knex): Promise<void> {
    // Deletes ALL existing entries
    await knex('users').del();

    return await knex('users').insert([
        {
            username: 'username',
            email: 'user.name@email.com',
            password: '$2a$11$3iVnQ2JpO7QL4zr9zu69/uE78RQVIMBl.kGfrOP5wIlKsqz.a2YW.',
            isDeleted: false,
        },
    ]);
}
