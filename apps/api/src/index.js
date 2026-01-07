import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "..", ".env") });

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";

import { connectToDatabase } from "./db/mongo.js";
import { User } from "./db/models/user.js";
import { authRouter } from "./routes/auth.js";
import { meRouter } from "./routes/me.js";

async function startServer() {
  await connectToDatabase();
  await User.init(); // ensure indexes exist (e.g., unique email)

  const app = express();

  app.use(cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }));

  app.use(cookieParser());
  app.use(express.json({ limit: "1mb" }));

  app.get("/health", async (req, res) => {
    try {
      if (mongoose.connection.readyState !== 1) {
        throw new Error("DB not connected");
      }
      await mongoose.connection.db.admin().ping();
      res.json({ ok: true, db: true });
    } catch (err) {
      console.error("health check error", err);
      res.status(500).json({ ok: false, error: "DB not reachable" });
    }
  });

  app.use("/auth", authRouter);
  app.use("/me", meRouter);

  const port = Number(process.env.PORT || 8080);
  app.listen(port, () => console.log(`API running on http://localhost:${port}`));
}

startServer().catch((err) => {
  console.error("Failed to start server", err);
  process.exit(1);
});
