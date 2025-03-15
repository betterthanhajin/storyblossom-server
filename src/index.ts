import "reflect-metadata";
import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { DataSource } from "typeorm";
import { User } from "./models/user.model";
import { Story } from "./models/story.model";
import { Node } from "./models/node.model";
import { Choice } from "./models/choice.model";

// Load environment variables
dotenv.config();

// Initialize Express app
const app: Application = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import routes (필요한 경우)
// app.use('/api/auth', authRoutes);
// app.use('/api/stories', storyRoutes);

// Health check route
app.get("/health", (req, res) => {
  res.status(200).send("Server is running");
});

// Database connection and server start
const startServer = async () => {
  try {
    const AppDataSource = new DataSource({
      type: "postgres",
      host: process.env.DB_HOST || "localhost",
      port: parseInt(process.env.DB_PORT || "5432"),
      username: process.env.DB_USERNAME || "postgres",
      password: process.env.DB_PASSWORD || "postgres",
      database: process.env.DB_DATABASE || "storyblossom",
      entities: [User, Story, Node, Choice],
      synchronize: true,
      logging: true,
    });

    await AppDataSource.initialize();
    console.log("Database connected successfully");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Error starting server:", error);
    console.error(error);
    process.exit(1);
  }
};

startServer();
