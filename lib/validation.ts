import { z } from "zod";
export const quoteFormSchema = z.object({ name: z.string().min(2), phone: z.string().regex(/^(?:\+91[ -]?)?[6-9]\d{9}$/, "Enter a valid Indian phone number"), email: z.string().email(), city: z.string().min(2), state: z.string().min(2), pincode: z.string().regex(/^[1-9][0-9]{5}$/), propertyType: z.enum(["residential","commercial","industrial"]), roofType: z.enum(["rcc","metal","tile","ground"]), ownership: z.enum(["owned","rented"]), monthlyBill: z.coerce.number().min(500).max(10000000), monthlyUnits: z.coerce.number().min(0).optional(), provider: z.string().min(2), billObjectKey: z.string().max(300).optional() });
export type QuoteFormData = z.infer<typeof quoteFormSchema>;
export type QuoteFormInput = z.input<typeof quoteFormSchema>;
export const settingsSchema = z.record(z.string(), z.coerce.number().finite().optional());
