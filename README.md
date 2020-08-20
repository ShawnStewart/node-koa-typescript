Overview
========

A simple Node/Koa API server written in TypeScript.

Quick start
-----------

1. Ensure you have [Node](https://nodejs.org/) installed  
`node -v`

2. Clone this repo and change directories  
`git clone https://github.com/ShawnStewart/node-koa-typescript.git <your_project_name>`  
`cd <your_project_name>`

3. Create a `.env` file, copy the contents from `.env.example` into `.env`, and provide a value for API_SECRET_KEY

4. Install dependencies  
`yarn install` or `npm install`

5. Run database migrations and seed database  
`yarn run db:reset:hard` or `npm run db:reset:hard`

6. Start the app!  
`yarn run server` or `npm run server`

Scripts
-------

Scripts should be ran with `yarn run <script name>` or `npm run <script name>`

* `server`: starts the application in development mode
* `test`: runs the test suite
* `test:watch`: runs the test suite in watch mode
* `db:makemigration <migration_name>`: generate a new migration file
* `db:makeseed <seed_name>`: generate a new seed file
* `db:migrate`: runs all migrations up to the latest
* `db:rollback <number>`: rollback specified number of migrations
* `db:seed`: seeds database
* `db:reset:hard`: rolls back all migrations, migrates to latest, and seeds database

Tech
----

[Koa](https://koajs.com/) - Node.js web framework  
[Knex](http://knexjs.org/) - Query builder  
[jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) - JWT library used for authentication  
[bcryptjs](https://github.com/dcodeIO/bcrypt.js) - Password hashing  

Contributions
-------------

Suggestions and contributions are always welcome!
