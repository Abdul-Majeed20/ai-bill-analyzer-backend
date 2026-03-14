import mongoose from "mongoose";

const aiServiceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    billDataId: {
      // Raw input data for the AI service (e.g., bill details)
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bill",
      required: true,
    },
    billExplanation: {
      // AI-generated output (e.g., analysis results, explanations)
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

const AIService = mongoose.model("AIService", aiServiceSchema);

export default AIService;
