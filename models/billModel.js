import mongoose from "mongoose";

const billSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  vendor: { // e.g., LESCO, MEPCO, GEPCO
    type: String,
    required: true,
  },
  billMonth: { // Month/Year of the bill
    type: String,
    required: true,
  },
  unitsConsumed: { // Number of units
    type: Number,
    required: true,
  },
  baseCost: { // Cost of electricity
    type: Number,
    required: true,
  },
  fuelAdjustment: { type: Number, default: 0 },
  fcSurcharge: { type: Number, default: 0 },
  quarterlyAdjustment: { type: Number, default: 0 },
  meterRent: { type: Number, default: 0 },
  serviceRent: { type: Number, default: 0 },
  electricityDuty: { type: Number, default: 0 },
  gst: { type: Number, default: 0 },
  totalAmount: { // Payable within due date
    type: Number,
    required: true,
  },
  tariffRate: { type: Number, default: 0 },
  rawText: { type: String }, // OCR text
  createdAt: {
    type: Date,
    default: Date.now,
  },
} , { timestamps: true });

const Bill = mongoose.model("Bill", billSchema);

export default Bill;