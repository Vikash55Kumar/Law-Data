import mongoose from "mongoose";

const LawSchema = new mongoose.Schema(
  {
    category: { type: String, required: true },
    act_name: { type: String, required: true, index: true },
    act_details: { type: String, required: true },
  },
  { timestamps: true }
);

const LawModel = mongoose.model("Law", LawSchema);

export default LawModel;
