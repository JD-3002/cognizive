import { Router } from "express";
import { isValidObjectId } from "mongoose";

import { User } from "../db/models/user.js";
import { requireAuth } from "../middleware/auth.js";

export const meRouter = Router();

meRouter.get("/", requireAuth, async (req, res) => {
  try {
    const userId = req.user?.sub;
    if (!isValidObjectId(userId)) return res.status(400).json({ error: "Invalid user id" });

    const user = await User.findById(userId).select("name email created_at");

    if (!user) return res.status(404).json({ error: "User not found" });

    return res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        created_at: user.created_at || null,
      },
    });
  } catch (err) {
    console.error("me error", err);
    return res.status(500).json({ error: "Server error" });
  }
});
