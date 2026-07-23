export type PropertyType = "residential" | "commercial" | "industrial";
export type RoofType = "rcc" | "metal" | "tile" | "ground";
export type LeadStatus = "new" | "called" | "site_visit" | "proposal_sent" | "won" | "lost";
export type QuoteInput = { monthlyBill: number; monthlyUnits?: number; tariff: number; propertyType: PropertyType; roofType: RoofType; panelWattage: number; solarPricePerWatt: number; gst: number; labourCost: number; inverterCostPerKw: number; subsidyPerKw: number; subsidyCap: number; roofAreaPerKw: number; annualDegradation: number; annualTariffIncrease: number; co2KgPerKwh: number; };
export type QuoteResult = { estimatedMonthlyUnits: number; systemSizeKw: number; panelsRequired: number; roofAreaSqFt: number; grossCost: number; subsidy: number; gstAmount: number; netCost: number; monthlySavings: number; annualSavings: number; twentyFiveYearSavings: number; co2OffsetKg: number; treesEquivalent: number; paybackYears: number; irr: number; };
export type CompanySettings = { companyName: string; phone: string; email: string; address: string; website: string; gstin: string; logoUrl: string; };
