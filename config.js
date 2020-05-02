const knex = require("knex");

const database = knex({
  client: "pg", // pg is the database library for postgreSQL on knexjs
  connection: {
    host: process.env.DB_HOST, // Your local host IP
    user: process.env.DB_USER, // Your postgres user name
    password: process.env.DB_PASSWORD, // Your postgres user password
    database: process.env.DATABASE_NAME, // Your database name,
    ssl: true // PARA CORRER LOCALMENTE SE DEBE CAMBIAR A FALSE
  }
});

module.exports = database;