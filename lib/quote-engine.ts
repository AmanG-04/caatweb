import type { QuoteInput, QuoteResult } from "./types";

const YEARLY_GENERATION_PER_KW = { min: 1200, max: 1400 };
const ROOF_AREA_PER_KW = 50;
const ANNUAL_SAVINGS_PER_KW = { min: 7200, max: 8400 };
const INSTALLED_COST_PER_KW_LAKH = { min: 0.6, max: 0.8 };

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
  const systemSizeKw = Math.max(3, Math.ceil((annualUsage / YEARLY_GENERATION_PER_KW.min) * 2) / 2);
  const yearlyGenerationMin = systemSizeKw * YEARLY_GENERATION_PER_KW.min;
  const yearlyGenerationMax = systemSizeKw * YEARLY_GENERATION_PER_KW.max;
  const annualSavingsMin = Math.round((systemSizeKw * ANNUAL_SAVINGS_PER_KW.min) / 500) * 500;
  const annualSavingsMax = Math.round((systemSizeKw * ANNUAL_SAVINGS_PER_KW.max) / 500) * 500;
  const investmentMin = Math.ceil(systemSizeKw * INSTALLED_COST_PER_KW_LAKH.min);
  const investmentMax = Math.ceil(systemSizeKw * INSTALLED_COST_PER_KW_LAKH.max);

  return {
    estimatedMonthlyUnits,
    systemSizeKw,
    yearlyGenerationRange: `${yearlyGenerationMin.toLocaleString("en-IN")}-${yearlyGenerationMax.toLocaleString("en-IN")} units per year`,
    roofAreaSqFt: systemSizeKw * ROOF_AREA_PER_KW,
    annualSavingsRange: formatInrRange(annualSavingsMin, annualSavingsMax, "per year"),
    investmentRange: `Rs. ${investmentMin}-${investmentMax} lakh`,
  };
}
