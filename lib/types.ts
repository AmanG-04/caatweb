export type PropertyType = "residential" | "commercial" | "industrial";
export type RoofType = "rcc" | "metal" | "tile" | "ground";
export type LeadStatus = "new" | "called" | "site_visit" | "proposal_sent" | "won" | "lost";
export type QuoteInput = { monthlyUnits: number; pricePerUnit: number; targetSavingsPercent: number; propertyType: PropertyType; roofType: RoofType; };
export type QuoteResult = { estimatedMonthlyUnits: number; pricePerUnit: number; targetSavingsPercent: number; systemSizeKw: number; yearlyGenerationRange: string; roofAreaSqFt: number; annualSavingsRange: string; };
export type CompanySettings = { companyName: string; phone: string; email: string; address: string; website: string; gstin: string; logoUrl: string; };
