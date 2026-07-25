import type { QuoteInput } from "./types";
/** Development seed only. Production values are loaded from D1 settings. */
export const TEMPLATE_QUOTE_SETTINGS: Omit<QuoteInput,"monthlyBill"|"monthlyUnits"|"propertyType"|"roofType"> = { tariff: 8, panelWattage: 540, solarPricePerWatt: 42, gst: .08, labourCost: 8000, inverterCostPerKw: 9000, subsidyPerKw: 14500, subsidyCap: 78000, roofAreaPerKw: 100, annualDegradation: .005, annualTariffIncrease: .05, co2KgPerKwh: .82 };

export const SETTING_FIELDS = [
  ["tariff", "Electricity tariff (₹/kWh)"], ["panelWattage", "Panel wattage (W)"],
  ["solarPricePerWatt", "Solar price (₹/W)"], ["gst", "GST (decimal)"],
  ["labourCost", "Labour cost (₹)"], ["inverterCostPerKw", "Inverter cost (₹/kW)"],
  ["subsidyPerKw", "Subsidy (₹/kW)"], ["subsidyCap", "Subsidy cap (₹)"],
  ["roofAreaPerKw", "Roof area per kW (sq ft)"], ["annualDegradation", "Annual degradation (decimal)"],
  ["annualTariffIncrease", "Annual tariff increase (decimal)"], ["co2KgPerKwh", "CO₂ offset (kg/kWh)"],
] as const;

const DB_KEYS: Record<string, string> = { panelWattage: "panel_wattage", solarPricePerWatt: "solar_price_per_watt", labourCost: "labour_cost", inverterCostPerKw: "inverter_cost_per_kw", subsidyPerKw: "subsidy_per_kw", subsidyCap: "subsidy_cap", roofAreaPerKw: "roof_area_per_kw", annualDegradation: "annual_degradation", annualTariffIncrease: "annual_tariff_increase", co2KgPerKwh: "co2_kg_per_kwh" };
export function settingsFromRows(rows: Array<{ key: string; value: string; value_type: string }>) {
  const reverse = Object.fromEntries(Object.entries(DB_KEYS).map(([app, db]) => [db, app]));
  const settings: Record<string, unknown> = { ...TEMPLATE_QUOTE_SETTINGS };
  for (const row of rows) { const key = reverse[row.key] ?? row.key; if (key in TEMPLATE_QUOTE_SETTINGS) settings[key] = row.value_type === "number" ? Number(row.value) : row.value; }
  return settings as typeof TEMPLATE_QUOTE_SETTINGS;
}
export function databaseSettingKey(key: string) { return DB_KEYS[key] ?? key; }
