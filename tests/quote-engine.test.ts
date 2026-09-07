import { describe, expect, it } from "vitest";
import { calculateQuote } from "../lib/quote-engine";

const baseInput = { propertyType: "residential" as const, roofType: "rcc" as const };

describe("quote engine", () => {
  it("uses the supplied per-kW values for the minimum 3 kW guide", () => {
    expect(calculateQuote({ ...baseInput, monthlyUnits: 174 })).toMatchObject({
      systemSizeKw: 3,
      yearlyGenerationRange: "3,600-4,200 units per year",
      roofAreaSqFt: 150,
      annualSavingsRange: "Rs. 21,500-Rs. 25,000 per year",
      investmentRange: "Rs. 2-3 lakh",
    });
  });

  it("calculates a continuous size in 0.5 kW increments", () => {
    expect(calculateQuote({ ...baseInput, monthlyUnits: 500 })).toMatchObject({
      systemSizeKw: 5,
      roofAreaSqFt: 250,
      yearlyGenerationRange: "6,000-7,000 units per year",
      investmentRange: "Rs. 3-4 lakh",
    });
  });

  it("is not capped at 10 kW", () => {
    expect(calculateQuote({ ...baseInput, monthlyUnits: 1250 })).toMatchObject({
      systemSizeKw: 12.5,
      roofAreaSqFt: 625,
      yearlyGenerationRange: "15,000-17,500 units per year",
      annualSavingsRange: "Rs. 90,000-Rs. 1,05,000 per year",
      investmentRange: "Rs. 8-10 lakh",
    });
  });
});
