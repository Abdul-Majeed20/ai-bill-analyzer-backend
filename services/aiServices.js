import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

console.log("🔑 Gemini API Key Loaded (Explainer):", !!GEMINI_API_KEY);

export const generateBillExplanation = async (billData) => {
  try {
    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

    const {
      vendor = "Electricity Provider",
      unitsConsumed = 0,
      baseCost = 0,
      fuelAdjustment = 0,
      fcSurcharge = 0,
      quarterlyAdjustment = 0,
      meterRent = 0,
      serviceRent = 0,
      electricityDuty = 0,
      gst = 0,
      totalAmount = 0,
      tariffRate = 0,
    } = billData;

    const isHighUsage = unitsConsumed > 200; // Example threshold for high usage

    const prompt = `
You are an intelligent electricity bill assistant for Pakistani users.

Explain the electricity bill in clear, simple English (maximum 180 words).
Write in a friendly tone like a helpful advisor.

BILL DETAILS
Company: ${vendor}
Units Consumed: ${unitsConsumed} kWh
Tariff Rate: Rs ${tariffRate} per unit
Base Cost: Rs ${baseCost}
Fuel Price Adjustment (FPA): Rs ${fuelAdjustment}
FC Surcharge: Rs ${fcSurcharge}
Quarterly Tariff Adjustment: Rs ${quarterlyAdjustment}
Meter Rent: Rs ${meterRent}
Service Rent: Rs ${serviceRent}
Electricity Duty: Rs ${electricityDuty}
GST: Rs ${gst}
Total Bill Amount: Rs ${totalAmount}

INSTRUCTIONS

1. Start with: "Assalam-o-Alaikum!"
2. Briefly explain what the total bill means.
3. Explain each major charge in simple words:
   - Base Cost
   - Fuel Price Adjustment
   - FC Surcharge
   - Quarterly Adjustment
   - Taxes (GST & Electricity Duty)
4. Analyze electricity usage based on units consumed.
   - If units > 200, say usage is high.
   - If units <= 200, say usage is moderate or good.
5. Provide practical electricity saving tips.

If usage is high, suggest at least 3 ways to reduce the bill such as:
- Using inverter AC or energy efficient appliances
- Turning off unnecessary lights
- Using LED bulbs
- Avoiding peak hour electricity usage
- Managing AC temperature

If usage is normal, appreciate the user and suggest 1-2 tips to maintain low usage.

6. End with a positive encouraging sentence.

RULES
- Do NOT use markdown
- Do NOT return JSON
- Do NOT use bullet symbols
- Write natural paragraphs
- Keep explanation easy for non-technical people
`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
    });

    const explanation = response.text;

    if (!explanation) {
      throw new Error("No explanation generated");
    }

    return explanation;
  } catch (error) {
    console.error("❌ Gemini Explainer Error:", error);
    throw error;
  }
};
