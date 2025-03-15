import { Router } from "express";
import {
  getChoicesByNodeId,
  createChoice,
  updateChoice,
  deleteChoice,
  reorderChoices,
} from "../controllers/choice.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

// Public routes
router.get("/node/:nodeId", getChoicesByNodeId);

// Protected routes
router.post("/", authMiddleware, createChoice);
router.put("/:id", authMiddleware, updateChoice);
router.delete("/:id", authMiddleware, deleteChoice);
router.post("/node/:nodeId/reorder", authMiddleware, reorderChoices);

export default router;
