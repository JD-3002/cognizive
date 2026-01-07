import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { User } from "../db/models/user.js";
import { signToken } from "../lib/jwt.js";
import { cookieName, cookieOptions } from "../lib/cookies.js";

export const authRouter = Router();

const registerSchema = z.object({
  name: z.string().min(2).max(60),
  email: z.string().email().max(120),
  password: z.string().min(8).max(72),
});

const loginSchema = z.object({
  email: z.string().email().max(120),
  password: z.string().min(8).max(72),
});

const toUserResponse = (doc) => ({
  id: doc.id,
  name: doc.name,
  email: doc.email,
  created_at: doc.created_at || null,
});

authRouter.post("/register", async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });

  const { name, email, password } = parsed.data;
  const emailLower = email.toLowerCase();

  try {
    const existing = await User.exists({ email: emailLower });
    if (existing) return res.status(409).json({ error: "Email already registered" });

    const passwordHash = await bcrypt.hash(password, 12);
    const userDoc = await User.create({
      name: name.trim(),
      email: emailLower,
      password_hash: passwordHash,
      created_at: new Date(),
    });

    const user = toUserResponse(userDoc);
    const token = signToken({ sub: user.id, email: user.email, name: user.name });
    res.cookie(cookieName(), token, cookieOptions());

    return res.status(201).json({ user });
  } catch (err) {
    console.error("register error", err);
    if (err?.code === 11000) return res.status(409).json({ error: "Email already registered" });
    return res.status(500).json({ error: "Server error" });
  }
});

authRouter.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });

  const { email, password } = parsed.data;
  const emailLower = email.toLowerCase();

  try {
    const user = await User.findOne({ email: emailLower });
    if (!user) return res.status(401).json({ error: "Invalid email or password" });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: "Invalid email or password" });

    const safeUser = toUserResponse(user);
    const token = signToken({ sub: safeUser.id, email: safeUser.email, name: safeUser.name });
    res.cookie(cookieName(), token, cookieOptions());

    return res.json({ user: safeUser });
  } catch (err) {
    console.error("login error", err);
    return res.status(500).json({ error: "Server error" });
  }
});

authRouter.post("/logout", async (req, res) => {
  res.clearCookie(cookieName(), { path: "/" });
  return res.json({ ok: true });
});
