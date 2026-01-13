import mongoose from "mongoose";

const attemptSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    question: { type: mongoose.Schema.Types.ObjectId, ref: "Question", required: true },
    topic: { type: mongoose.Schema.Types.ObjectId, ref: "Topic", required: true },
    selected_choice_id: { type: String, required: true, trim: true, maxlength: 20 },
    correct: { type: Boolean, required: true },
    response_time_ms: { type: Number, min: 0, max: 30 * 60 * 1000 }, // cap at 30 minutes
    difficulty: { type: Number, min: 1, max: 5 },
    emotion_label: { type: String, trim: true, lowercase: true, maxlength: 40 },
    created_at: { type: Date, default: Date.now },
  },
  {
    versionKey: false,
    timestamps: { createdAt: "created_at", updatedAt: false },
  }
);

attemptSchema.index({ user: 1, created_at: -1 });
attemptSchema.index({ user: 1, topic: 1, created_at: -1 });

export const Attempt = mongoose.models.Attempt || mongoose.model("Attempt", attemptSchema);
