import { Router } from "express";
import {
  getNodesByStoryId,
  getNodeById,
  createNode,
  updateNode,
  deleteNode,
} from "../controllers/node.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

// Public routes
router.get("/story/:storyId", getNodesByStoryId);
router.get("/:id", getNodeById);

// Protected routes
router.post("/", authMiddleware, createNode);
router.put("/:id", authMiddleware, updateNode);
router.delete("/:id", authMiddleware, deleteNode);

export default router;
