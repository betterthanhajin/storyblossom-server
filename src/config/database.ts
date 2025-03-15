import { ConnectionOptions } from "typeorm";
import { User } from "../models/user.model";
import { Story } from "../models/story.model";
import { Node } from "../models/node.model";
import { Choice } from "../models/choice.model";

const config: ConnectionOptions = {
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USERNAME || "postgres",
  password: process.env.DB_PASSWORD || "password",
  database: process.env.DB_DATABASE || "storyblossom",
  synchronize: process.env.NODE_ENV === "development", // Auto-create database schema in development
  logging: process.env.NODE_ENV === "development",
  entities: [User, Story, Node, Choice],
  migrations: ["src/migrations/**/*.ts"],
  subscribers: ["src/subscribers/**/*.ts"],
  // cli: {
  //   entitiesDir: "src/models",
  //   migrationsDir: "src/migrations",
  //   subscribersDir: "src/subscribers",
  // },
};

export default config;
