import mongoose from "mongoose";

const emotionEventSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    label: { type: String, required: true, trim: true, lowercase: true, maxlength: 40 },
    confidence: { type: Number, min: 0, max: 1 },
    context: { type: String, trim: true, maxlength: 120 },
    window_ms: { type: Number, min: 0, max: 10 * 60 * 1000 }, // optional aggregate window length
    sample_count: { type: Number, min: 1, max: 1000 },
    created_at: { type: Date, default: Date.now },
  },
  {
    versionKey: false,
    timestamps: { createdAt: "created_at", updatedAt: false },
  }
);

emotionEventSchema.index({ user: 1, created_at: -1 });

export const EmotionEvent = mongoose.models.EmotionEvent || mongoose.model("EmotionEvent", emotionEventSchema);
