"use client";

import { useEffect, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Sun, Upload } from "lucide-react";
import { Button, Card } from "@/components/ui";
import { SiteHeader } from "@/components/site-header";
import { quoteFormSchema, type QuoteFormData, type QuoteFormInput } from "@/lib/validation";

type ExtractedFields = {
  provider?: string | null;
  consumerName?: string | null;
  averageMonthlyUnits?: number | null;
  monthlyUnits?: number | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
};

type ApiResult = {
  success?: boolean;
  data?: { objectKey?: string; fields?: ExtractedFields; quote?: { id?: string } & Record<string, unknown> };
  error?: { message?: string; code?: string; existingQuote?: Duplicate };
};

type Duplicate = { id: string; name: string; createdAt: string; result: Record<string, unknown> };

async function readResult(response: Response, fallback: string): Promise<ApiResult> {
  const text = await response.text();
  if (!text.trim()) throw new Error(fallback);
  return JSON.parse(text) as ApiResult;
}

export default function QuotePage() {
  const router = useRouter();
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [billName, setBillName] = useState("");
  const [billObjectKey, setBillObjectKey] = useState<string>();
  const [billStatus, setBillStatus] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [duplicate, setDuplicate] = useState<Duplicate | null>(null);
  const [pendingData, setPendingData] = useState<QuoteFormData | null>(null);
  const { register, handleSubmit, setValue, trigger, control, formState: { errors } } = useForm<QuoteFormInput, unknown, QuoteFormData>({
    resolver: zodResolver(quoteFormSchema),
    defaultValues: { propertyType: "residential", roofType: "rcc", ownership: "owned", systemType: "on_grid", batteryRequired: "no", pricePerUnit: 8, targetSavingsPercent: 100 },
  });
  const systemType = useWatch({ control, name: "systemType" });
  const batteryRequired = useWatch({ control, name: "batteryRequired" });
  const targetSavingsPercent = Number(useWatch({ control, name: "targetSavingsPercent" }) ?? 50);
  const lastAutofilledPincode = useRef("");

  useEffect(() => {
    if (systemType !== "hybrid") setValue("batteryRequired", "no", { shouldValidate: true });
  }, [setValue, systemType]);

  const moveToPersonalDetails = async () => {
    if (await trigger(["propertyType", "roofType", "ownership", "systemType", "batteryRequired", "monthlyUnits", "pricePerUnit", "targetSavingsPercent"])) setStep(2);
  };

  const applyExtractedFields = (fields: ExtractedFields) => {
    if (fields.averageMonthlyUnits ?? fields.monthlyUnits) setValue("monthlyUnits", fields.averageMonthlyUnits ?? fields.monthlyUnits ?? 0, { shouldValidate: true });
    if (fields.provider) setValue("provider", fields.provider, { shouldValidate: true });
    if (fields.consumerName) setValue("name", fields.consumerName, { shouldValidate: true });
    if (fields.address) setValue("address", fields.address, { shouldValidate: true });
    if (fields.city) setValue("city", fields.city, { shouldValidate: true });
    if (fields.state) setValue("state", fields.state, { shouldValidate: true });
    if (fields.pincode) setValue("pincode", fields.pincode, { shouldValidate: true });
  };

  const uploadBill = async (file: File | null) => {
    if (!file) return;
    setError("");
    if (!["application/pdf", "image/png", "image/jpeg"].includes(file.type) || file.size > 10 * 1024 * 1024) {
      setError("Upload a PDF, PNG or JPEG under 10MB.");
      return;
    }
    setBillName(file.name);
    setIsUploading(true);
    setBillStatus("Uploading your bill…");
    try {
      const form = new FormData();
      form.append("file", file);
      const upload = await fetch("/api/upload", { method: "POST", body: form });
      const uploadResult = await readResult(upload, "Bill upload did not return a valid response.");
      const objectKey = uploadResult.data?.objectKey;
      if (!upload.ok || !objectKey) throw new Error(uploadResult.error?.message ?? "Bill upload failed.");
      setBillObjectKey(objectKey);
      setStep(1);
      setBillStatus("Reading your bill in the background. You can choose your system preferences while we work.");
      void (async () => {
        try {
          const extraction = await fetch("/api/bill/extract", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ objectKey }) });
          const extractionResult = await readResult(extraction, "Bill reading did not return a valid response.");
          if (!extraction.ok || !extractionResult.data?.fields) throw new Error(extractionResult.error?.message ?? "We could not read this bill automatically.");
          applyExtractedFields(extractionResult.data.fields);
          setBillStatus("Bill read. Your personal details have been filled where available; please verify them on the next step.");
        } catch (extractionError) {
          setBillStatus(extractionError instanceof Error ? `${extractionError.message} Please enter your average monthly units manually.` : "We could not read this bill automatically. Please enter your average monthly units manually.");
        }
      })();
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Bill upload failed.");
      setBillName("");
    } finally {
      setIsUploading(false);
    }
  };

  const submit = async (data: QuoteFormData, allowDuplicate = false) => {
    if (!billObjectKey) {
      setError("Upload your electricity bill to continue.");
      setStep(0);
      return;
    }
    setIsSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/lead", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...data, billObjectKey, allowDuplicate }) });
      const result = await readResult(response, "Estimate service did not return a valid response.");
      if (response.status === 409 && result.error?.code === "DUPLICATE_QUOTE" && result.error.existingQuote) {
        setDuplicate(result.error.existingQuote);
        setPendingData(data);
        return;
      }
      if (!response.ok || !result.data?.quote?.id) throw new Error(result.error?.message ?? "Unable to create your estimate.");
      localStorage.setItem("solar_quote", JSON.stringify({ ...data, quote: result.data.quote }));
      router.push(`/quote/result?id=${result.data.quote.id}`);
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Unable to create your estimate.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openExisting = () => {
    if (!duplicate) return;
    localStorage.setItem("solar_quote", JSON.stringify({ quote: { id: duplicate.id, ...duplicate.result }, name: duplicate.name }));
    router.push(`/quote/result?id=${duplicate.id}`);
  };

  return (
    <main className="quote-flow min-h-screen py-4">
      <SiteHeader context="Solar estimate" />
      <div className="container-wide">
        <div className="quote-content mx-auto max-w-2xl py-8">
          <div className="quote-stepper mb-6 flex items-center justify-between" aria-label={`Step ${step + 1} of 3`}>
            {["Upload bill", "Project details", "Your details"].map((label, index) => (
              <div key={label} className={`flex items-center gap-2 text-xs font-bold ${index <= step ? "text-teal" : "text-ink/30"}`}>
                <span className={`grid h-8 w-8 place-items-center rounded-full ${index < step ? "bg-teal text-white" : index === step ? "bg-lime text-ink" : "bg-ink/10"}`}>{index < step ? <Check size={15} /> : index + 1}</span>
                <span>{label}</span>
              </div>
            ))}
          </div>
          <Card className="quote-form-panel">
            {step === 0 ? (
              <div>
                <h1 className="text-3xl font-black">Start with your electricity bill.</h1>
                 <p className="mt-3 text-cream/75">We use your bill to suggest a general solar-system size. It is the quickest and most useful way to start.</p>
                 <label className="mt-8 block text-left">
                   <span className="flex items-center justify-between text-sm font-bold text-white">
                     <span>How much of your bill do you want to save?</span>
                     <output className="rounded-full bg-lime px-3 py-1 text-xs font-black text-ink">{targetSavingsPercent}%</output>
                   </span>
                   <input type="range" min="10" max="100" step="5" defaultValue="100" {...register("targetSavingsPercent")} className="mt-4 w-full accent-lime" aria-label="Target bill savings percentage" />
                   <span className="mt-2 flex justify-between text-xs text-cream/60"><span>10%</span><span>100%</span></span>
                 </label>
                <label className="mt-8 flex cursor-pointer flex-col items-center justify-center gap-4 rounded-[1.75rem] border-2 border-dashed border-lime/70 bg-night/45 px-6 py-12 text-center transition-colors hover:bg-teal/40">
                  <input className="sr-only" type="file" accept="application/pdf,image/png,image/jpeg" disabled={isUploading} onChange={(event) => void uploadBill(event.target.files?.[0] ?? null)} />
                  <span className="grid h-16 w-16 place-items-center rounded-full bg-lime text-teal"><Upload size={28} aria-hidden="true" /></span>
                  <span><span className="block text-xl font-black text-white">Upload electricity bill</span><span className="mt-2 block text-sm text-cream/75">PDF or clear photo, up to 10MB</span></span>
                </label>
                {error && <p className="mt-4 text-sm text-red-300">{error}</p>}
              </div>
            ) : step === 1 ? (
              <div>
                <h1 className="text-3xl font-black">Set up your project.</h1>
                <p className="mt-3 text-cream/75">Choose the property and power configuration you are looking for. Your bill is still being read in the background.</p>
                <p role="status" className="mt-5 rounded-2xl border border-lime/30 bg-teal/35 px-4 py-3 text-sm leading-6 text-cream">{billStatus}</p>
                <div className="mt-7 grid gap-4 sm:grid-cols-2">
                   <Select required label="Property type" {...register("propertyType")} options={[["residential", "Residential"], ["commercial", "Commercial"], ["industrial", "Industrial"]]} />
                  <Select required label="Roof type" {...register("roofType")} options={[["rcc", "RCC"], ["metal", "Metal"], ["tile", "Tile"], ["ground", "Ground mount"]]} />
                  <Select required label="Roof ownership" {...register("ownership")} options={[["owned", "Owned"], ["rented", "Rented"]]} />
                   <Input required type="number" label="Average monthly units" error={errors.monthlyUnits?.message} {...register("monthlyUnits")} />
                   <Input required type="number" min="0.01" step="0.01" label="Average price per unit (Rs.)" error={errors.pricePerUnit?.message} {...register("pricePerUnit")} />
                   <div className="rounded-2xl border border-lime/30 bg-teal/35 p-4 text-sm text-cream/85">
                     Target bill saving: <strong className="text-lime">{targetSavingsPercent}%</strong>. The estimate will be sized around this target.
                   </div>
                </div>
                <div className="mt-7">
                  <p className="mb-3 text-sm font-bold">System type<sup className="ml-1 text-red-300">*</sup></p>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {[["on_grid", "On-grid", "Lower bills with a reliable grid connection."], ["off_grid", "Off-grid", "Independent power with battery backup."], ["hybrid", "Hybrid", "Grid-connected power with backup flexibility."]].map(([value, title, description]) => (
                      <label key={value} className={`cursor-pointer rounded-2xl border p-4 transition-colors ${systemType === value ? "border-lime bg-teal/70 text-white ring-2 ring-lime/35" : "border-white/25 bg-night/55 text-cream hover:border-lime/60"}`}>
                        <input className="sr-only" type="radio" value={value} {...register("systemType")} />
                        <span className="block font-bold">{title}</span>
                        <span className="mt-2 block text-xs leading-5 text-cream/75">{description}</span>
                      </label>
                    ))}
                  </div>
                </div>
                {systemType === "hybrid" && (
                  <div className="mt-6">
                    <p className="mb-3 text-sm font-bold">Battery backup required?<sup className="ml-1 text-red-300">*</sup></p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {[["yes", "Yes, include battery backup"], ["no", "No battery backup"]].map(([value, title]) => (
                        <label key={value} className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-4 transition-colors ${batteryRequired === value ? "border-lime bg-teal/70 text-white ring-2 ring-lime/35" : "border-white/25 bg-night/55 text-cream hover:border-lime/60"}`}>
                          <input className="accent-lime" type="radio" value={value} {...register("batteryRequired")} />
                          <span className="font-bold">{title}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
                <div className="mt-8 flex justify-between">
                  <Button type="button" variant="outline" onClick={() => setStep(0)}><ArrowLeft size={16} /> Replace bill</Button>
                  <Button type="button" onClick={() => void moveToPersonalDetails()}>Continue<ArrowRight size={16} /></Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit((data) => submit(data))}>
                <h1 className="text-3xl font-black">Your details.</h1>
                <p className="mt-3 text-cream/75">Your bill may have filled some details already. Check them and add the best way to contact you.</p>
                <p role="status" className="mt-5 rounded-2xl border border-lime/30 bg-teal/35 px-4 py-3 text-sm leading-6 text-cream">{billStatus}</p>
                <div className="mt-7 grid gap-4 sm:grid-cols-2">
                  <Input required label="Full name" error={errors.name?.message} {...register("name")} />
                  <Input required label="Phone" error={errors.phone?.message} {...register("phone")} />
                  <Input required label="Email" error={errors.email?.message} {...register("email")} />
                  <Input required label="Address" wrapperClassName="sm:col-span-2" error={errors.address?.message} {...register("address")} />
                  <Input required label="City" error={errors.city?.message} {...register("city")} />
                  <Input required label="State" error={errors.state?.message} {...register("state")} />
                  <Input required label="Pincode" inputMode="numeric" maxLength={6} error={errors.pincode?.message} {...register("pincode")} />
                </div>
                <div className="mt-8 flex justify-between">
                  <Button type="button" variant="outline" onClick={() => setStep(1)}><ArrowLeft size={16} /> Back</Button>
                  <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Creating estimate…" : "See my estimate"}<ArrowRight size={16} /></Button>
                </div>
                {error && <p className="mt-4 text-sm text-red-300">{error}</p>}
              </form>
            )}
          </Card>
        </div>
      </div>
      {duplicate && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink/70 p-6">
          <div className="w-full max-w-md rounded-3xl bg-cream p-8 shadow-2xl">
            <p className="text-sm font-bold uppercase tracking-widest text-teal">Existing estimate found</p>
            <h2 className="mt-3 text-2xl font-black">You already have an estimate with us.</h2>
            <p className="mt-3 text-sm leading-6 text-ink/60">We found an earlier estimate for this phone number or email address. You can view it, or create a new one.</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button onClick={openExisting}>View existing estimate</Button>
              <Button variant="outline" onClick={() => { const data = pendingData; setDuplicate(null); if (data) void submit(data, true); }}>Create another</Button>
              <button type="button" className="w-full text-sm text-ink/50" onClick={() => setDuplicate(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

const Input = ({ label, error, wrapperClassName, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string; wrapperClassName?: string }) => (
  <label className={wrapperClassName}>
    <span className="mb-2 block text-sm font-bold">{label}{props.required && <sup className="ml-1 text-red-300">*</sup>}</span>
    <input className="w-full rounded-2xl border border-white/25 bg-night/55 px-4 py-3 text-cream outline-none focus:border-lime" {...props} />
    {error && <small className="text-red-300">{error}</small>}
  </label>
);

const Select = ({ label, options, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { label: string; options: string[][] }) => (
  <label>
    <span className="mb-2 block text-sm font-bold">{label}{props.required && <sup className="ml-1 text-red-300">*</sup>}</span>
    <select className="w-full rounded-2xl border border-white/25 bg-night/55 px-4 py-3 text-cream outline-none focus:border-lime" {...props}>{options.map(([value, text]) => <option key={value} value={value}>{text}</option>)}</select>
  </label>
);
