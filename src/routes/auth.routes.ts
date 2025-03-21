import { Router } from "express";
// We'll implement these controllers later
import { authMiddleware } from "../middleware/auth.middleware";
import { register, login, getProfile } from "../controllers/auth.controller";

const router = Router();

// Auth routes
router.post("/register", register);
router.post("/login", login);
router.get("/profile", authMiddleware, getProfile);

export default router;
