import { describe, expect, it } from "vitest";
import { calculateQuote } from "../lib/quote-engine";

const baseInput = { propertyType: "residential" as const, roofType: "rcc" as const };

describe("quote engine", () => {
  it("sizes the system from the requested bill-saving target", () => {
    expect(calculateQuote({ ...baseInput, monthlyUnits: 174, pricePerUnit: 8, targetSavingsPercent: 100 })).toMatchObject({
      systemSizeKw: 3,
      yearlyGenerationRange: "3,600-4,200 units per year",
      roofAreaSqFt: 150,
       annualSavingsRange: "Rs. 16,500-Rs. 16,500 per year",
    });
  });

  it("calculates a continuous size in 0.5 kW increments", () => {
    expect(calculateQuote({ ...baseInput, monthlyUnits: 500, pricePerUnit: 8, targetSavingsPercent: 100 })).toMatchObject({
      systemSizeKw: 5,
      roofAreaSqFt: 250,
      yearlyGenerationRange: "6,000-7,000 units per year",
    });
  });

  it("is not capped at 10 kW", () => {
    expect(calculateQuote({ ...baseInput, monthlyUnits: 1250, pricePerUnit: 8, targetSavingsPercent: 100 })).toMatchObject({
      systemSizeKw: 12.5,
      roofAreaSqFt: 625,
      yearlyGenerationRange: "15,000-17,500 units per year",
      annualSavingsRange: "Rs. 1,20,000-Rs. 1,20,000 per year",
    });
  });
});
