import { extractBillData } from "../services/ocrService.js";
import { generateBillExplanation } from "../services/aiServices.js";
import AIService from "../models/aiServiceModel.js";
import ObjectId from "mongoose";
import Bill from "../models/billModel.js";
export const analayzeBillData = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: 0,
        message: "No bill image uploaded",
      });
    }

    const userId = req.user._id; // ✅ from middleware

    const buffer = req.file.buffer;

    const result = await extractBillData(buffer, userId);

    const bill = new Bill(result);

    await bill.save();

    return res.status(200).json({
      status: 1,
      success: true,
      data: bill,
    });
  } catch (error) {
    console.error("Server Error:", error);
    return res.status(500).json({
      status: 0,
      message: "Internal Server Error",
    });
  }
};

// Analyze manually entered bill data
export const analyzeManualBillData = async (req, res) => {
  try {
    const {
      units,
      tariffRate,
      fuelAdjustment,
      fcSurcharge,
      quarterlyAdjustment,
      meterRent,
      serviceRent,
      electricityDuty,
      gst,
    } = req.body;

    if (!units || !tariffRate) {
      return res.status(400).json({
        status: 0,
        message: "Units and tariff rate are required",
      });
    }

    // Calculate the bill analysis
    const unitConsumed = parseFloat(units);
    const rate = parseFloat(tariffRate);
    const baseCost = unitConsumed * rate;

    const additionalCharges = {
      fuelAdjustment: parseFloat(fuelAdjustment) || 0,
      fcSurcharge: parseFloat(fcSurcharge) || 0,
      quarterlyAdjustment: parseFloat(quarterlyAdjustment) || 0,
      meterRent: parseFloat(meterRent) || 0,
      serviceRent: parseFloat(serviceRent) || 0,
      electricityDuty: parseFloat(electricityDuty) || 0,
      gst: parseFloat(gst) || 0,
    };

    const totalExtraCharges = Object.values(additionalCharges).reduce(
      (a, b) => a + b,
      0,
    );
    const totalCost = baseCost + totalExtraCharges;

    const result = {
      units: unitConsumed,
      tariffRate: rate,
      baseCost: baseCost.toFixed(2),
      totalExtraCharges: totalExtraCharges.toFixed(2),
      totalCharges: totalCost.toFixed(2),
      ...additionalCharges,
    };

    res.status(200).json({
      status: 1,
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(500).json({ message: `Error Occurred: ${error.message}` });
  }
};

export const explainBill = async (req, res) => {
  const billData = {
    vendor: req.body.company || "Electricity Provider",
    unitsConsumed: parseFloat(req.body.units) || 0,
    baseCost: parseFloat(req.body.baseCost) || 0,
    fuelAdjustment: parseFloat(req.body.fuelAdjustment) || 0,
    fcSurcharge: parseFloat(req.body.fcSurcharge) || 0,
    quarterlyAdjustment: parseFloat(req.body.quarterlyAdjustment) || 0,
    meterRent: parseFloat(req.body.meterRent) || 0,
    serviceRent: parseFloat(req.body.serviceRent) || 0,
    electricityDuty: parseFloat(req.body.electricityDuty) || 0,
    gst: parseFloat(req.body.gst) || 0,
    totalAmount: parseFloat(req.body.totalBill) || 0,
    tariffRate: parseFloat(req.body.tariffRate) || 0,
    extraCharges: parseFloat(req.body.extraCharges) || 0,
    payableWithinDueDate: parseFloat(req.body.payableWithinDueDate) || 0,
    billMonth: req.body.billMonth,
    billId: req.body.billId,
  };

  try {
    const explanation = await generateBillExplanation(billData);

    if (!explanation) {
      return res.status(500).json({
        success: false,
        message: "Failed to generate explanation",
      });
    }

    const userId = req.user._id; // ✅ from middleware

    const existingBill = await Bill.findOne({ _id: billData.billId });

    if (!existingBill) {
      return res.status(404).json({
        success: false,
        message: "Bill not found",
      });
    }

    const aiRecord = new AIService({
      userId,
      billDataId: billData.billId, // Link to the specific bill data
      billExplanation: explanation,
    });

    await aiRecord.save();

    res.status(200).json({
      success: true,
      data: explanation,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error generating explanation: " + error.message,
    });
  }
};

export const getBillHistory = async (req, res) => {
  try {
    const userId = req.user._id; // ✅ from middleware
    const bills = await AIService.find({ userId })
      .sort({ createdAt: -1 })
      .populate("billDataId"); // Populate bill data for context
    if (!bills) {
      res.status(401).send({
        status: false,
        message: "Failded to fetch Bill data",
      });
    }

    const formattedBills = bills.map((bill) => ({
      ...bill._doc,
      ...bill.billDataId._doc,
    }));
    
    res.status(200).json({
      success: true,
      data: formattedBills,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching bill history: " + error.message,
    });
  }
};
