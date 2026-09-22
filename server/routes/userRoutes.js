import express from "express";

import {
  getUsers,
  createAdmin,
  deleteUser,
  updateProfile,
  getCurrentUser,
} from "../controllers/userController.js";

import { protect } from "../middleware/authMiddleware.js";
import { requireSuperAdmin } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get(
  "/",
  protect,
  requireSuperAdmin,
  getUsers
);

router.post(
  "/admins",
  protect,
  requireSuperAdmin,
  createAdmin
);

router.delete(
  "/:id",
  protect,
  requireSuperAdmin,
  deleteUser
);

router.put(
  "/profile",
  protect,
  updateProfile
);

router.get(
  "/me",
  protect,
  getCurrentUser
);

export default router;