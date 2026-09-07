import type { QuoteInput, QuoteResult } from "./types";

const YEARLY_GENERATION_PER_KW = { min: 1200, max: 1400 };
const ROOF_AREA_PER_KW = 50;
const ANNUAL_GENERATION_PER_KW = YEARLY_GENERATION_PER_KW;

function formatInrRange(min: number, max: number, unit: string) {
  return `Rs. ${min.toLocaleString("en-IN")}-Rs. ${max.toLocaleString("en-IN")} ${unit}`;
}

/**
 * General guide based on 1,200-1,400 annual units generated per kW, the
 * production range supplied for 3, 5 and 10 kW systems. Size is rounded up
 * to the next 0.5 kW so the conservative end of generation covers usage.
 */
export function calculateQuote(input: QuoteInput): QuoteResult {
  const estimatedMonthlyUnits = Math.round(input.monthlyUnits);
  const annualUsage = estimatedMonthlyUnits * 12;
  const targetAnnualGeneration = annualUsage * (input.targetSavingsPercent / 100);
  const systemSizeKw = Math.max(3, Math.ceil((targetAnnualGeneration / ANNUAL_GENERATION_PER_KW.min) * 2) / 2);
  const yearlyGenerationMin = systemSizeKw * YEARLY_GENERATION_PER_KW.min;
  const yearlyGenerationMax = systemSizeKw * YEARLY_GENERATION_PER_KW.max;
  const annualSavingsMin = Math.round((Math.min(targetAnnualGeneration, systemSizeKw * YEARLY_GENERATION_PER_KW.min) * input.pricePerUnit) / 500) * 500;
  const annualSavingsMax = Math.round((Math.min(annualUsage, systemSizeKw * YEARLY_GENERATION_PER_KW.max) * input.pricePerUnit) / 500) * 500;

  return {
    estimatedMonthlyUnits,
    pricePerUnit: input.pricePerUnit,
    targetSavingsPercent: input.targetSavingsPercent,
    systemSizeKw,
    yearlyGenerationRange: `${yearlyGenerationMin.toLocaleString("en-IN")}-${yearlyGenerationMax.toLocaleString("en-IN")} units per year`,
    roofAreaSqFt: systemSizeKw * ROOF_AREA_PER_KW,
    annualSavingsRange: formatInrRange(annualSavingsMin, annualSavingsMax, "per year"),
  };
}
