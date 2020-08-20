import * as Knex from 'knex';

export async function up(knex: Knex): Promise<void> {
    const exists = await knex.schema.hasTable('users');

    if (!exists) {
        return knex.schema.createTable('users', (users) => {
            users.increments();
            users.string('username', 20).notNullable().unique();
            users.string('password').notNullable();
            users.string('email');
            users.dateTime('createdAt').notNullable().defaultTo(knex.fn.now());
            users.dateTime('updatedAt').notNullable().defaultTo(knex.fn.now());
            users.dateTime('deletedAt');
            users.boolean('isDeleted').notNullable().defaultTo(false);
        });
    }
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTableIfExists('users');
}
