import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();
import Bill from "../models/billModel.js";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

console.log("🔑 Gemini API Key Loaded:", !!GEMINI_API_KEY);

export const extractBillData = async (imageBuffer, userId) => {
  try {
    console.log("🔍 Sending image to Gemini for OCR...");

    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

    const base64Image = imageBuffer.toString("base64");

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview", // ✅ updated model name
      contents: [
        {
          parts: [
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: base64Image,
              },
            },
            {
              text: `You are an expert at reading Pakistani electricity bills. Extract data from this bill image and return ONLY a valid JSON object with no markdown, no explanation, just raw JSON.

Use this exact structure:
{
  "vendor": "LESCO or HESCO or MEPCO or GEPCO or unknown",
  "billMonth": "e.g. February 2023",
  "unitsConsumed": 0,
  "baseCost": 0,
  "fuelAdjustment": 0,
  "fcSurcharge": 0,
  "quarterlyAdjustment": 0,
  "meterRent": 0,
  "serviceRent": 0,
  "electricityDuty": 0,
  "gst": 0,
  "totalAmount": 0,
  "tariffRate": 0
}

Rules:
- All numeric fields must be numbers, not strings
- If a field is not found, use 0
- totalAmount should be the amount payable within due date
- tariffRate = baseCost / unitsConsumed (calculate it)`,
            },
          ],
        },
      ],
    });

    const rawText = response.text;
    console.log("📄 Gemini Raw Response:", rawText);

    // Clean in case Gemini wraps in ```json blocks
    const cleanedText = rawText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const parsedData = JSON.parse(cleanedText);
    parsedData.userId = userId;


    const existingBill = await Bill.findOne({ userId, billMonth: parsedData.billMonth });
    if (existingBill) {
      console.log("⚠️ Bill for this month already exists, updating with new data...");
      Object.assign(existingBill, parsedData);
      await existingBill.save();
      return existingBill;
    }

    return parsedData;
  } catch (error) {
    console.error("❌ Gemini OCR Service Error:", error);
    throw error;
  }
};

// Analyze manually entered bill data
export const analyzeManualBillData = async (data) => {
  try {
    const { units, tariffRate, fuelAdjustment, fcSurcharge, quarterlyAdjustment, meterRent, serviceRent, electricityDuty, gst } = data;
    if (!units || !tariffRate) {
      throw new Error("Units and tariff rate are required");
    }
    
    const baseCost = units * tariffRate;
    const totalExtraCharges = fuelAdjustment + fcSurcharge + quarterlyAdjustment + meterRent + serviceRent;
    const totalAmount = baseCost + totalExtraCharges + electricityDuty + gst;

    return {
      units,
      tariffRate,
      baseCost,
      fuelAdjustment,
      fcSurcharge,
      quarterlyAdjustment,
      meterRent,
      serviceRent,
      electricityDuty,
      gst,
      totalAmount
    };
  } catch (error) {
    console.error("❌ Manual Bill Analysis Error:", error);
    throw error;
  }
};