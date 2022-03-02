import * as dotenv from "dotenv";
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

const result = dotenv.config({
    path: `./env/development.env`,
});

const config = {
    type: "mysql",
    host: process.env.DB_HOST,
    username: process.env.DB_USER,
    password: process.env.DB_PWD,
    database: process.env.DB_NAME,
    synchronize: true,
    logging: false,
    migrationsRun: false,
    namingStrategy: new SnakeNamingStrategy(), //convert camel case to snake pattern
    entities: ["src/entity/**/*.ts"],
    migrations: ["src/migration/**/*.ts"],
    subscribers: ["src/subscriber/**/*.ts"],
    cli: {
        entitiesDir: "src/entity",
        migrationsDir: "src/migration",
        subscribersDir: "src/subscriber",
    }
};

module.exports = config;
