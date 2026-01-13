import mongoose from "mongoose";

const topicSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, minlength: 2, maxlength: 120 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, minlength: 2, maxlength: 140 },
    description: { type: String, trim: true, maxlength: 500 },
    tags: [{ type: String, trim: true, lowercase: true, maxlength: 50 }],
    created_at: { type: Date, default: Date.now },
  },
  {
    versionKey: false,
    timestamps: { createdAt: "created_at", updatedAt: false },
  }
);

export const Topic = mongoose.models.Topic || mongoose.model("Topic", topicSchema);
