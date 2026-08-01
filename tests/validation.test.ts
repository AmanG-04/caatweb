import { describe, expect, it } from "vitest";
import { quoteFormSchema, settingsSchema } from "../lib/validation";

const validLead = {
  name: "Aman Gupta", phone: "9876543210", email: "aman@example.com", address: "20, Sreshtha Vihar", city: "Delhi", state: "Delhi", pincode: "110001",
  propertyType: "residential", roofType: "rcc", ownership: "owned", systemType: "on_grid", batteryRequired: "no", monthlyUnits: 500, pricePerUnit: 8, provider: "BSES",
};

describe("validation", () => {
  it("accepts a valid Indian quote request", () => expect(quoteFormSchema.safeParse(validLead).success).toBe(true));
  it("requires the customer address", () => expect(quoteFormSchema.safeParse({ ...validLead, address: "" }).success).toBe(false));
  it("requires average monthly units and price per unit", () => expect(quoteFormSchema.safeParse({ ...validLead, monthlyUnits: "", pricePerUnit: "" }).success).toBe(false));
  it("rejects invalid Indian phone and PIN code", () => {
    const result = quoteFormSchema.safeParse({ ...validLead, phone: "1234567890", pincode: "011001" });
    expect(result.success).toBe(false);
  });
  it("rejects unknown or unsafe quote settings", () => {
    expect(settingsSchema.safeParse({ tariff: 8, unknown: 1 }).success).toBe(false);
    expect(settingsSchema.safeParse({ gst: 1.5 }).success).toBe(false);
  });
});
