import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "..", ".env") });

import { connectToDatabase, disconnectFromDatabase } from "./mongo.js";
import { User } from "./models/user.js";

async function setup() {
  console.log("Ensuring MongoDB indexes...");

  await connectToDatabase();
  await User.init(); // builds indexes (e.g., unique email)

  console.log("Done.");
  await disconnectFromDatabase();
}

setup().catch(async (err) => {
  console.error("DB setup failed:", err);
  try { await disconnectFromDatabase(); } catch {}
  process.exit(1);
});
