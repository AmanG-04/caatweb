import type { QuoteInput } from "./types";
/** Development seed only. Production values are loaded from D1 settings. */
export const TEMPLATE_QUOTE_SETTINGS: Omit<QuoteInput,"monthlyBill"|"monthlyUnits"|"propertyType"|"roofType"> = { tariff: 8, panelWattage: 540, solarPricePerWatt: 42, gst: .08, labourCost: 8000, inverterCostPerKw: 9000, subsidyPerKw: 14500, subsidyCap: 78000, roofAreaPerKw: 100, annualDegradation: .005, annualTariffIncrease: .05, co2KgPerKwh: .82 };
