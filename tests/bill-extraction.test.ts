import { describe, expect, it } from "vitest";
import { extractBillFieldsFromText, hasHighConfidence } from "../lib/bill-extraction";

const bsesText = `BSES RAJDHANI POWER LIMITED
A JOINT VENTURE OF GOVERNMENT OF DELHI
Consumer No. : 101-4567-8901
Consumer Name : RAHUL SHARMA
Bill Month : Sep-2025
Connected Load : 5.00 KW
Units Consumed (in kWh) : 285
Rate per Unit : Rs. 8.50
Fixed Charges : Rs. 120.00
Total Amount Payable : Rs. 2,542.00`;

const tpddlText = `TATA POWER DELHI DISTRIBUTION LIMITED (TPDDL)
Consumer Name : Sunita Devi
Billing Period : 12 Aug 2025 to 11 Sep 2025
Total Units consumed during the period : 320
Total Amount Payable : Rs. 2,720.00
Present Reading : 12500`;

const dhbvnText = `DHBVN - DAKSHIN HARYANA BIJLI VITRAN NIGAM
Account No : 5551234567
Name of Consumer : ANIL KUMAR YADAV
Units billed for the period : 190.0
Average Rate per Unit : 7.25
Amount after Due Date : Rs. 1,377.50`;

describe("bill text extraction", () => {
  it("extracts units, explicit tariff, provider, name and month from a BSES-style bill", () => {
    const fields = extractBillFieldsFromText(bsesText);
    expect(fields.monthlyUnits).toBe(285);
    expect(fields.pricePerUnit).toBe(8.5);
    expect(fields.provider).toBe("BSES Rajdhani Power");
    expect(fields.consumerName).toBe("RAHUL SHARMA");
    expect(fields.billingMonth).toBe("Sep-2025");
    expect(hasHighConfidence(fields)).toBe(true);
  });

  it("derives an implied tariff from the total amount when no rate is printed", () => {
    const fields = extractBillFieldsFromText(tpddlText);
    expect(fields.monthlyUnits).toBe(320);
    expect(fields.pricePerUnit).toBe(8.5);
    expect(fields.provider).toBe("Tata Power Delhi Distribution");
    expect(fields.billingMonth).toContain("2025");
  });

  it("ignores cumulative meter readings and load figures when finding units", () => {
    const fields = extractBillFieldsFromText(tpddlText);
    expect(fields.monthlyUnits).not.toBe(12500);
  });

  it("picks the last rate-looking number on a labelled tariff line", () => {
    const fields = extractBillFieldsFromText(dhbvnText);
    expect(fields.monthlyUnits).toBe(190);
    expect(fields.pricePerUnit).toBe(7.25);
    expect(fields.consumerName).toBe("ANIL KUMAR YADAV");
  });

  it("returns empty fields for unrelated text", () => {
    const fields = extractBillFieldsFromText("Welcome to the CAAT PowerBot newsletter.");
    expect(fields).toEqual({
      provider: null,
      consumerName: null,
      monthlyUnits: null,
      pricePerUnit: null,
      billingMonth: null,
    });
    expect(hasHighConfidence(fields)).toBe(false);
  });

  it("rejects out-of-range numbers such as cumulative readings as units", () => {
    const fields = extractBillFieldsFromText(`BSES RAJDHANI POWER LIMITED
Units Consumed (in kWh) : 12500480`);
    expect(fields.monthlyUnits).toBeNull();
    expect(hasHighConfidence(fields)).toBe(false);
  });
});
