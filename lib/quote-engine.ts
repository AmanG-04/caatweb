import type { QuoteInput, QuoteResult } from "./types";

/** Versioned, intentionally transparent template model. All commercial values come from settings. */
export function calculateQuote(input: QuoteInput): QuoteResult {
  const units = input.monthlyUnits ?? input.monthlyBill / input.tariff;
  const systemSizeKw = Math.max(1, Math.ceil((units / 120) * 10) / 10);
  const panelsRequired = Math.ceil((systemSizeKw * 1000) / input.panelWattage);
  const roofAreaSqFt = Math.ceil(systemSizeKw * input.roofAreaPerKw);
  const baseCost = systemSizeKw * 1000 * input.solarPricePerWatt + systemSizeKw * input.labourCost + systemSizeKw * input.inverterCostPerKw;
  const gstAmount = baseCost * input.gst;
  const grossCost = baseCost + gstAmount;
  const subsidy = Math.min(systemSizeKw * input.subsidyPerKw, input.subsidyCap);
  const netCost = Math.max(0, grossCost - subsidy);
  const monthlySavings = Math.min(input.monthlyBill, units * input.tariff * 0.92);
  const annualSavings = monthlySavings * 12;
  let twentyFiveYearSavings = 0;
  for (let year = 0; year < 25; year++) twentyFiveYearSavings += annualSavings * Math.pow(1 + input.annualTariffIncrease, year) * Math.pow(1 - input.annualDegradation, year);
  const paybackYears = annualSavings ? netCost / annualSavings : 0;
  const irr = netCost ? Math.pow(Math.max(twentyFiveYearSavings / netCost, 0.0001), 1 / 25) - 1 : 0;
  const co2OffsetKg = units * 12 * input.co2KgPerKwh;
  return { estimatedMonthlyUnits: Math.round(units), systemSizeKw, panelsRequired, roofAreaSqFt, grossCost: Math.round(grossCost), subsidy: Math.round(subsidy), gstAmount: Math.round(gstAmount), netCost: Math.round(netCost), monthlySavings: Math.round(monthlySavings), annualSavings: Math.round(annualSavings), twentyFiveYearSavings: Math.round(twentyFiveYearSavings), co2OffsetKg: Math.round(co2OffsetKg), treesEquivalent: Math.round(co2OffsetKg / 21), paybackYears: Number(paybackYears.toFixed(1)), irr: Number((irr * 100).toFixed(1)) };
}
