import * as Knex from 'knex';

export async function seed(knex: Knex): Promise<void> {
    // Deletes ALL existing entries
    await knex('users').del();

    return await knex('users').insert([
        {
            username: 'shawn',
            email: 'shawn@email.com',
            password: '$2a$11$3iVnQ2JpO7QL4zr9zu69/uE78RQVIMBl.kGfrOP5wIlKsqz.a2YW.',
            isDeleted: false,
        },
        {
            username: 'alec',
            password: '$2a$11$3iVnQ2JpO7QL4zr9zu69/uE78RQVIMBl.kGfrOP5wIlKsqz.a2YW.',
            isDeleted: false,
        },
        {
            username: 'xavier',
            password: '$2a$11$3iVnQ2JpO7QL4zr9zu69/uE78RQVIMBl.kGfrOP5wIlKsqz.a2YW.',
            isDeleted: false,
        },
        {
            username: 'jake',
            password: '$2a$11$3iVnQ2JpO7QL4zr9zu69/uE78RQVIMBl.kGfrOP5wIlKsqz.a2YW.',
            deletedAt: new Date(),
            isDeleted: true,
        },
    ]);
}
