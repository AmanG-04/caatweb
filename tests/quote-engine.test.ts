import { describe, expect, it } from "vitest";
import { calculateQuote } from "../lib/quote-engine";
import { TEMPLATE_QUOTE_SETTINGS } from "../lib/settings";
describe("quote engine",()=>{const input={...TEMPLATE_QUOTE_SETTINGS,monthlyBill:8000,monthlyUnits:1000,propertyType:"residential" as const,roofType:"rcc" as const};it("returns a recommended system and costs",()=>{const q=calculateQuote(input);expect(q.systemSizeKw).toBeGreaterThan(0);expect(q.panelsRequired).toBeGreaterThan(0);expect(q.netCost).toBeGreaterThan(0);expect(q.monthlySavings).toBeGreaterThan(0)});it("never returns a negative net cost",()=>{const q=calculateQuote({...input,subsidyCap:99999999});expect(q.netCost).toBeGreaterThanOrEqual(0)});});
