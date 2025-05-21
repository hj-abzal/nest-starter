require('dotenv').config({
  path: `.env.${process.env.NODE_ENV || 'development'}`,
});
console.log('R')
module.exports = {
  development: {
    dialect: 'postgres',
    host: process.env.PGHOST,
    port: Number(process.env.PGPORT),
    username: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
    logging: false,
  },
  production: {
    dialect: 'postgres',
    host: process.env.PGHOST,
    port: Number(process.env.PGPORT),
    username: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
    logging: false,
  },
};
