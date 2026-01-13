import mongoose from "mongoose";

const choiceSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, trim: true, minlength: 1, maxlength: 20 },
    text: { type: String, required: true, trim: true, minlength: 1, maxlength: 500 },
    is_correct: { type: Boolean, default: false },
  },
  { _id: false }
);

const questionSchema = new mongoose.Schema(
  {
    topic: { type: mongoose.Schema.Types.ObjectId, ref: "Topic", required: true },
    prompt: { type: String, required: true, trim: true, minlength: 10, maxlength: 1000 },
    choices: {
      type: [choiceSchema],
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length >= 2 && arr.some((c) => c.is_correct === true),
        message: "At least two choices with one marked correct are required",
      },
    },
    difficulty: { type: Number, min: 1, max: 5, default: 3 },
    tags: [{ type: String, trim: true, lowercase: true, maxlength: 50 }],
    source: { type: String, enum: ["manual", "generated"], default: "manual" },
    explanation: { type: String, trim: true, maxlength: 1000 },
    created_at: { type: Date, default: Date.now },
  },
  {
    versionKey: false,
    timestamps: { createdAt: "created_at", updatedAt: false },
  }
);

export const Question = mongoose.models.Question || mongoose.model("Question", questionSchema);
