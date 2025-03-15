import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "../models/user.model";
import { Story } from "../models/story.model";
import { Node } from "../models/node.model";
import { Choice } from "../models/choice.model";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USERNAME || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_DATABASE || "storyblossom",
  synchronize: process.env.NODE_ENV === "development",
  logging: process.env.NODE_ENV === "development",
  entities: [User, Story, Node, Choice],
  migrations: [],
  subscribers: [],
});
