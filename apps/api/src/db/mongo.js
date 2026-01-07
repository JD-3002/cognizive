import mongoose from "mongoose";

let connectionPromise;

export async function connectToDatabase() {
  if (mongoose.connection.readyState === 1) return mongoose.connection;

  const uri = process.env.MONGO_URI?.trim();
  const dbName = process.env.MONGO_DB_NAME?.trim() || "cognivize";

  if (!uri) {
    throw new Error("MONGO_URI is not set. Update apps/api/.env with your Mongo connection string.");
  }

  if (!connectionPromise) {
    connectionPromise = mongoose.connect(uri, { dbName });
  }
  await connectionPromise;
  return mongoose.connection;
}

export async function disconnectFromDatabase() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  connectionPromise = null;
}
