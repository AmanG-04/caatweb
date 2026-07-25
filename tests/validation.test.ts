import { describe, expect, it } from "vitest";
import { quoteFormSchema, settingsSchema } from "../lib/validation";

const validLead = {
  name: "Aman Gupta", phone: "9876543210", email: "aman@example.com", city: "Delhi", state: "Delhi", pincode: "110001",
  propertyType: "residential", roofType: "rcc", ownership: "owned", monthlyBill: 5000, provider: "BSES",
};

describe("validation", () => {
  it("accepts a valid Indian quote request", () => expect(quoteFormSchema.safeParse(validLead).success).toBe(true));
  it("treats an empty monthly-units field as optional", () => expect(quoteFormSchema.parse({ ...validLead, monthlyUnits: "" }).monthlyUnits).toBeUndefined());
  it("rejects invalid Indian phone and PIN code", () => {
    const result = quoteFormSchema.safeParse({ ...validLead, phone: "1234567890", pincode: "011001" });
    expect(result.success).toBe(false);
  });
  it("rejects unknown or unsafe quote settings", () => {
    expect(settingsSchema.safeParse({ tariff: 8, unknown: 1 }).success).toBe(false);
    expect(settingsSchema.safeParse({ gst: 1.5 }).success).toBe(false);
  });
});
