import { z } from "zod";
export const quoteFormSchema = z.object({ name: z.string().min(2), phone: z.string().regex(/^(?:\+91[ -]?)?[6-9]\d{9}$/, "Enter a valid Indian phone number"), email: z.string().email(), address: z.string().min(5), city: z.string().min(2), state: z.string().min(2), pincode: z.string().regex(/^[1-9][0-9]{5}$/), propertyType: z.enum(["residential","commercial","industrial"]), roofType: z.enum(["rcc","metal","tile","ground"]), ownership: z.enum(["owned","rented"]), systemType: z.enum(["on_grid","off_grid","hybrid"]), batteryRequired: z.enum(["yes","no"]), monthlyUnits: z.coerce.number().min(1).max(1000000), pricePerUnit: z.coerce.number().positive().max(1000), provider: z.preprocess(value => value === "" || value === null ? undefined : value, z.string().min(2).optional()), billObjectKey: z.string().max(300).optional(), sitePhotoObjectKey: z.string().max(300).optional() });
export type QuoteFormData = z.infer<typeof quoteFormSchema>;
export type QuoteFormInput = z.input<typeof quoteFormSchema>;
export const settingsSchema = z.object({
  tariff: z.coerce.number().finite().positive().max(1000).optional(),
  panelWattage: z.coerce.number().finite().positive().max(2000).optional(),
  solarPricePerWatt: z.coerce.number().finite().positive().max(10000).optional(),
  gst: z.coerce.number().finite().min(0).max(1).optional(),
  labourCost: z.coerce.number().finite().nonnegative().max(100000000).optional(),
  inverterCostPerKw: z.coerce.number().finite().nonnegative().max(1000000).optional(),
  subsidyPerKw: z.coerce.number().finite().nonnegative().max(1000000).optional(),
  subsidyCap: z.coerce.number().finite().nonnegative().max(100000000).optional(),
  roofAreaPerKw: z.coerce.number().finite().positive().max(10000).optional(),
  annualDegradation: z.coerce.number().finite().min(0).max(1).optional(),
  annualTariffIncrease: z.coerce.number().finite().min(0).max(1).optional(),
  co2KgPerKwh: z.coerce.number().finite().nonnegative().max(100).optional(),
}).strict();

export const blogPostSchema = z.object({
  title: z.string().trim().min(3).max(160),
  slug: z.string().trim().min(3).max(160).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase words separated by hyphens."),
  excerpt: z.string().trim().min(10).max(360),
  content: z.string().trim().min(20).max(50000),
  status: z.enum(["draft", "published"]),
}).strict();

export type BlogPostInput = z.infer<typeof blogPostSchema>;
