"use client";
import { useEffect, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import {
  quoteFormSchema,
  type QuoteFormData,
  type QuoteFormInput,
} from "@/lib/validation";
import { Button, Card } from "@/components/ui";
import { ArrowLeft, ArrowRight, Check, Sun, Upload } from "lucide-react";
import { SiteHeader } from "@/components/site-header";

const labels = [
  "Your energy",
  "About you",
  "Your property",
  "System preference",
];
const ranges = [
  ["monthlyUnits", "pricePerUnit", "provider"],
  ["name", "phone", "email", "address", "city", "state", "pincode"],
  ["propertyType", "roofType", "ownership"],
  ["systemType", "batteryRequired"],
] as const;
type Duplicate = {
  id: string;
  name: string;
  createdAt: string;
  result: Record<string, unknown>;
};

type ExtractedFields = {
  provider?: string | null;
  consumerName?: string | null;
  monthlyUnits?: number | null;
  pricePerUnit?: number | null;
  billingMonth?: string | null;
};

type ApiResult = {
  success?: boolean;
  data?: { objectKey?: string; fields?: ExtractedFields; source?: string; quote?: { id?: string } & Record<string, unknown> };
  error?: { code?: string; message?: string; existingQuote?: Duplicate };
  meta?: { message?: string };
};

type PincodeLookupResult = {
  success?: boolean;
  data?: { city?: string; state?: string };
  error?: { message?: string };
};

async function readApiResult(response: Response, fallbackMessage: string): Promise<ApiResult> {
  const body = await response.text();
  if (!body.trim()) {
    throw new Error(response.ok ? fallbackMessage : `${fallbackMessage} (HTTP ${response.status}).`);
  }

  try {
    return JSON.parse(body) as ApiResult;
  } catch {
    throw new Error(response.ok ? fallbackMessage : `${fallbackMessage} (HTTP ${response.status}).`);
  }
}

export default function QuotePage() {
  const [step, setStep] = useState(0);
  const [validatedStep, setValidatedStep] = useState(-1);
  const [file, setFile] = useState<File | null>(null);
  const [billObjectKey, setBillObjectKey] = useState<string | null>(null);
  const [readingBill, setReadingBill] = useState(false);
  const [billMessage, setBillMessage] = useState("");
  const [billReadFromUpload, setBillReadFromUpload] = useState(false);
  const [manualOpen, setManualOpen] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [sitePhoto, setSitePhoto] = useState<File | null>(null);
  const [calculating, setCalculating] = useState(false);
  const [error, setError] = useState("");
  const [duplicate, setDuplicate] = useState<Duplicate | null>(null);
  const [pendingData, setPendingData] = useState<QuoteFormData | null>(null);
  const [pincodeMessage, setPincodeMessage] = useState("");
  const lastAutofilledPincode = useRef("");
  const router = useRouter();
  const {
    register,
    handleSubmit,
    trigger,
    control,
    getValues,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<QuoteFormInput, unknown, QuoteFormData>({
    resolver: zodResolver(quoteFormSchema),
    defaultValues: {
      propertyType: "residential",
      roofType: "rcc",
      ownership: "owned",
      systemType: "on_grid",
      batteryRequired: "no",
    },
  });
  const pincode = useWatch({ control, name: "pincode" });
  const systemType = useWatch({ control, name: "systemType" });
  const batteryRequired = useWatch({ control, name: "batteryRequired" });

  useEffect(() => {
    if (systemType !== "hybrid") setValue("batteryRequired", "no", { shouldValidate: true });
  }, [setValue, systemType]);

  useEffect(() => {
    const normalizedPincode = String(pincode ?? "").replace(/\D/g, "").slice(0, 6);
    if (normalizedPincode.length !== 6) {
      setPincodeMessage("");
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setPincodeMessage("Looking up city and state…");
      try {
        const response = await fetch(`/api/pincode/${normalizedPincode}`, { signal: controller.signal });
        const result = await response.json() as PincodeLookupResult;
        if (!response.ok || !result.success || !result.data?.city || !result.data.state) {
          setPincodeMessage(result.error?.message ?? "Please enter city and state manually.");
          return;
        }

        const shouldReplaceAutofill = lastAutofilledPincode.current !== normalizedPincode;
        if (shouldReplaceAutofill || !getValues("city")) setValue("city", result.data.city, { shouldValidate: true, shouldDirty: true });
        if (shouldReplaceAutofill || !getValues("state")) setValue("state", result.data.state, { shouldValidate: true, shouldDirty: true });
        lastAutofilledPincode.current = normalizedPincode;
        setPincodeMessage("City and state filled from the PIN code. You can edit them if needed.");
      } catch (lookupError) {
        if (lookupError instanceof DOMException && lookupError.name === "AbortError") return;
        setPincodeMessage("City and state lookup is unavailable. Please enter them manually.");
      }
    }, 450);

    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [getValues, pincode, setValue]);
  const next = async () => {
    const valid = await trigger(ranges[step]);
    if (valid) setStep((current) => Math.min(3, current + 1));
    else {
      setValidatedStep(step);
      if (step === 0) setManualOpen(true);
    }
  };
  const handleBillSelect = async (selected: File | null) => {
    setError("");
    setBillMessage("");
    setBillReadFromUpload(false);
    setFile(selected);
    setBillObjectKey(null);
    if (!selected) return;
    const allowedTypes = ["application/pdf", "image/png", "image/jpeg"];
    if (!allowedTypes.includes(selected.type) || selected.size > 10 * 1024 * 1024) {
      setError("Only valid PDF, PNG or JPEG files up to 10MB are accepted.");
      return;
    }
    try {
      setReadingBill(true);
      setBillMessage("Uploading your bill…");
      const form = new FormData();
      form.append("file", selected);
      const uploadResponse = await fetch("/api/upload", { method: "POST", body: form });
      const uploadResult = await readApiResult(uploadResponse, "Bill upload did not return a valid response");
      if (!uploadResponse.ok) throw new Error(uploadResult.error?.message ?? "Bill upload failed");
      const objectKey = uploadResult.data?.objectKey;
      if (!objectKey) throw new Error("Bill upload did not return a file reference.");
      setBillObjectKey(objectKey);
      try {
        setBillMessage("Reading your bill…");
        const extractResponse = await fetch("/api/bill/extract", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ objectKey }),
        });
        const extractResult = await readApiResult(extractResponse, "Bill reading did not return a valid response");
        if (extractResponse.ok && extractResult.data?.fields) {
          const fields = extractResult.data.fields;
          const applyValue = (name: "monthlyUnits" | "pricePerUnit" | "provider", value: string | number | null | undefined) => {
            if (value === null || value === undefined || value === "") return;
            const current = getValues(name);
            if (current === undefined || current === null || String(current).trim() === "") {
              setValue(name, value as React.ComponentProps<"input">["value"], { shouldValidate: false, shouldDirty: true });
            }
          };
          applyValue("monthlyUnits", fields.monthlyUnits);
          applyValue("pricePerUnit", fields.pricePerUnit);
          applyValue("provider", fields.provider);
          if (fields.monthlyUnits != null || fields.pricePerUnit != null) {
            setBillReadFromUpload(true);
            setManualOpen(true);
            setBillMessage("Read from your bill — please verify the details below. Everything is editable.");
          } else {
            setBillMessage("We read your bill but could not find the units or rate — please enter them manually.");
          }
          return;
        }
        setBillMessage(extractResult.meta?.message ?? "We couldn't read the bill automatically — please enter the details below.");
      } catch {
        setBillMessage("We couldn't read the bill automatically — please enter the details below.");
      }
    } catch {
      setError("Your bill could not be uploaded right now. You can continue by entering the details manually.");
    } finally {
      setReadingBill(false);
    }
  };
  const fieldError = (field: keyof QuoteFormData) =>
    validatedStep === step ? errors[field]?.message : undefined;
  const submit = async (data: QuoteFormData, allowDuplicate = false) => {
    setCalculating(true);
    setError("");
    try {
      let storedBillObjectKey = billObjectKey ?? undefined;
      let sitePhotoObjectKey: string | undefined;
      if (file && !storedBillObjectKey) {
        const form = new FormData();
        form.append("file", file);
        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: form,
        });
        const uploadResult = await readApiResult(uploadResponse, "Bill upload did not return a valid response");
        if (!uploadResponse.ok)
          throw new Error(uploadResult.error?.message ?? "Bill upload failed");
        if (!uploadResult.data?.objectKey) throw new Error("Bill upload did not return a file reference.");
        storedBillObjectKey = uploadResult.data.objectKey;
        setBillObjectKey(uploadResult.data.objectKey);
      }
      if (sitePhoto) {
        const form = new FormData();
        form.append("file", sitePhoto);
        form.append("kind", "site-photo");
        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: form,
        });
        const uploadResult = await readApiResult(uploadResponse, "Site photo upload did not return a valid response");
        if (!uploadResponse.ok)
          throw new Error(
            uploadResult.error?.message ?? "Site photo upload failed",
          );
        if (!uploadResult.data?.objectKey) throw new Error("Site photo upload did not return a file reference.");
        sitePhotoObjectKey = uploadResult.data.objectKey;
      }
      const response = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          billObjectKey: storedBillObjectKey,
          sitePhotoObjectKey,
          allowDuplicate,
        }),
      });
      const result = await readApiResult(response, "Estimate service did not return a valid response");
      if (response.status === 409 && result.error?.code === "DUPLICATE_QUOTE") {
        if (!result.error.existingQuote) throw new Error("The existing estimate could not be loaded.");
        setDuplicate(result.error.existingQuote);
        setPendingData(data);
        setCalculating(false);
        return;
      }
      if (!response.ok)
        throw new Error(result.error?.message ?? "Unable to create estimate");
      if (!result.data?.quote?.id) throw new Error("The estimate service did not return an estimate ID.");
      localStorage.setItem(
        "solar_quote",
        JSON.stringify({ ...data, quote: result.data?.quote }),
      );
      router.push(`/quote/result?id=${result.data.quote.id}`);
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Unable to create your estimate.",
      );
      setCalculating(false);
    }
  };
  const openExisting = () => {
    if (!duplicate) return;
    localStorage.setItem(
      "solar_quote",
      JSON.stringify({
        quote: { id: duplicate.id, ...duplicate.result },
        name: duplicate.name,
      }),
    );
    router.push(`/quote/result?id=${duplicate.id}`);
  };
  return (
    <main className="quote-flow quote-shell relative min-h-screen overflow-hidden py-4">
      <div className="relative z-10">
      <SiteHeader context="Solar savings estimate" />
      <div className="container-wide">
        <div className="quote-content mx-auto max-w-2xl py-5">
          <div className="quote-stepper mb-6 flex min-h-8 items-center justify-between" aria-label={`Step ${step + 1} of ${labels.length}: ${labels[step]}`}>
            {labels.map((label, index) => (
              <div
                key={label}
                className={`flex items-center gap-2 text-xs font-bold ${index <= step ? "text-teal" : "text-ink/30"}`}
              >
                <span
                  className={`grid h-8 w-8 place-items-center rounded-full ${index < step ? "bg-teal text-white" : index === step ? "bg-lime" : "bg-ink/10"}`}
                >
                  {index < step ? <Check size={15} /> : index + 1}
                </span>
                <span className="hidden sm:block">{label}</span>
              </div>
            ))}
          </div>
          {/* Previous form card retained for reference: <Card> */}
          <Card className="quote-form-panel">
            <form
              onSubmit={handleSubmit(
                (data) => submit(data),
                () => {
                  setValidatedStep(3);
                  setError("Please check the highlighted fields.");
                },
              )}
            >
              <div key={step} className="step-panel">
                <h1 className="text-3xl font-black">{labels[step]}</h1>
                <p className="mt-2 text-xs font-bold uppercase tracking-[.14em] text-lime/80">Step {step + 1} of {labels.length}</p>
                <p className="mt-2 min-h-6 text-cream/75">
                  {step === 0
                    ? "Upload your electricity bill and we will read it for you — or enter the details manually."
                    : step === 1
                      ? "Let’s start with the basics."
                      : step === 2
                        ? "A little context helps us size your system."
                        : "Choose the system that fits your property and backup needs."}
                </p>
                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  {step === 0 && (
                    <div className="sm:col-span-2 space-y-5">
                      <label
                        className={`group relative flex cursor-pointer flex-col items-center justify-center gap-4 rounded-[1.75rem] border-2 border-dashed px-6 py-12 text-center transition-colors ${dragActive || file ? "border-lime/80 bg-teal/45" : "border-white/40 bg-night/50 hover:border-lime/70 hover:bg-teal/35"}`}
                        onDragOver={(event) => {
                          event.preventDefault();
                          setDragActive(true);
                        }}
                        onDragLeave={() => setDragActive(false)}
                        onDrop={(event) => {
                          event.preventDefault();
                          setDragActive(false);
                          void handleBillSelect(event.dataTransfer.files?.[0] ?? null);
                        }}
                      >
                        <input
                          className="sr-only"
                          type="file"
                          accept="application/pdf,image/png,image/jpeg"
                          onChange={(event) => void handleBillSelect(event.target.files?.[0] ?? null)}
                        />
                        <span className="grid h-16 w-16 place-items-center rounded-full bg-lime text-teal shadow-[0_10px_30px_rgba(216,243,106,.35)] transition-transform duration-300 group-hover:scale-105">
                          {readingBill ? <Sun size={30} className="calculating-orb" aria-hidden="true" /> : <Upload size={28} aria-hidden="true" />}
                        </span>
                        {file ? (
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-bold text-white">{file.name}</span>
                            <span className="mt-1 block text-xs leading-5 text-cream/75">
                              {readingBill ? "Reading your bill…" : "Uploaded — tap to choose a different file"}
                            </span>
                          </span>
                        ) : (
                          <span>
                            <span className="block text-lg font-black tracking-tight text-white sm:text-xl">Upload your electricity bill</span>
                            <span className="mt-1.5 block text-xs leading-5 text-cream/75 sm:text-sm">
                              PDF or a clear photo, up to 10MB.
                              <span className="mt-0.5 block">We read your units and rate automatically.</span>
                            </span>
                          </span>
                        )}
                        {file && !readingBill && (
                          <button
                            type="button"
                            className="rounded-full border border-white/25 px-3 py-1.5 text-xs font-bold text-cream/80 hover:border-lime/60"
                            onClick={(event) => {
                              event.preventDefault();
                              event.stopPropagation();
                              void handleBillSelect(null);
                            }}
                          >
                            Remove bill
                          </button>
                        )}
                      </label>
                      {billMessage && (
                        <p role="status" className={`flex items-start gap-2 rounded-2xl border px-4 py-3 text-sm leading-5 ${billReadFromUpload ? "border-lime/40 bg-teal/40 text-cream" : "border-white/20 bg-night/55 text-cream/75"}`}>
                          {billReadFromUpload && <Check size={16} className="mt-0.5 shrink-0 text-lime" aria-hidden="true" />}
                          {billMessage}
                        </p>
                      )}
                      {!manualOpen ? (
                        <p className="text-center">
                          <button
                            type="button"
                            onClick={() => setManualOpen(true)}
                            className="text-xs font-bold uppercase tracking-[.14em] text-cream/60 underline decoration-white/25 underline-offset-4 transition-colors hover:text-lime"
                          >
                            or enter your usage manually
                          </button>
                        </p>
                      ) : (
                        <div className="rounded-2xl border border-white/15 bg-night/40 p-5 sm:p-6">
                          <p className="text-sm font-bold">
                            Your usage<sup className="ml-1 text-red-500">*</sup>
                          </p>
                          <div className="mt-4 grid gap-4 sm:grid-cols-2">
                            <Input
                              required
                              type="number"
                              label="Average monthly units (kWh)"
                              error={fieldError("monthlyUnits")}
                              {...register("monthlyUnits")}
                            />
                            <Input
                              required
                              type="number"
                              step="0.01"
                              label="Price per unit (INR)"
                              error={fieldError("pricePerUnit")}
                              {...register("pricePerUnit")}
                            />
                            <Input
                              label="Electricity provider"
                              wrapperClassName="sm:col-span-2"
                              error={fieldError("provider")}
                              {...register("provider")}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  {step === 1 && (
                    <>
                      <Input
                        required
                        label="Full name"
                        error={fieldError("name")}
                        {...register("name")}
                      />
                      <Input
                        required
                        label="Phone"
                        error={fieldError("phone")}
                        {...register("phone")}
                      />
                      <Input
                        required
                        label="Email"
                        error={fieldError("email")}
                        {...register("email")}
                      />
                      <Input
                        required
                        label="Address"
                        wrapperClassName="sm:col-span-2"
                        error={fieldError("address")}
                        {...register("address")}
                      />
                      <Input
                        required
                        label="City"
                        error={fieldError("city")}
                        {...register("city")}
                      />
                      <Input
                        required
                        label="State"
                        error={fieldError("state")}
                        {...register("state")}
                      />
                      <Input
                        required
                        label="Pincode"
                        error={fieldError("pincode")}
                        inputMode="numeric"
                        maxLength={6}
                        {...register("pincode", { onChange: (event) => { event.target.value = event.target.value.replace(/\D/g, "").slice(0, 6); } })}
                      />
                      {pincodeMessage && <p className="sm:col-span-2 -mt-1 text-xs leading-5 text-cream/75" role="status">{pincodeMessage}</p>}
                    </>
                  )}
                  {step === 2 && (
                    <>
                      <Select
                        required
                        label="Property type"
                        options={[
                          ["residential", "Residential"],
                          ["commercial", "Commercial"],
                          ["industrial", "Industrial"],
                        ]}
                        {...register("propertyType")}
                      />
                      <Select
                        required
                        label="Roof type"
                        options={[
                          ["rcc", "RCC"],
                          ["metal", "Metal"],
                          ["tile", "Tile"],
                          ["ground", "Ground mount"],
                        ]}
                        {...register("roofType")}
                      />
                      <Select
                        required
                        label="Roof ownership"
                        options={[
                          ["owned", "Owned"],
                          ["rented", "Rented"],
                        ]}
                        {...register("ownership")}
                      />
                      <label className="sm:col-span-2">
                        <span className="mb-2 block text-sm font-bold">
                          Site photo{" "}
                          <span className="font-normal text-ink/45">
                            (optional)
                          </span>
                        </span>
                        <span className="flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-ink/20 p-5 text-sm text-ink/60">
                          <Upload size={20} />
                          {sitePhoto ? sitePhoto.name : "JPG or PNG up to 10MB"}
                          <input
                            className="hidden"
                            type="file"
                            accept="image/png,image/jpeg"
                            onChange={(event) =>
                              setSitePhoto(event.target.files?.[0] ?? null)
                            }
                          />
                        </span>
                      </label>
                    </>
                  )}
                  {step === 3 && (
                    <div className="sm:col-span-2 space-y-6">
                      <div>
                        <p className="mb-3 text-sm font-bold">
                          System type<sup className="ml-1 text-red-500">*</sup>
                        </p>
                        <div className="grid gap-3 sm:grid-cols-3">
                          {[
                            [
                              "on_grid",
                              "On-grid",
                              "Best for savings with a reliable grid connection.",
                            ],
                            [
                              "off_grid",
                              "Off-grid",
                              "Independent power with battery backup.",
                            ],
                            [
                              "hybrid",
                              "Hybrid",
                              "Grid-connected power with backup flexibility.",
                            ],
                          ].map(([value, title, description]) => (
                            <label
                              key={value}
                              className={`cursor-pointer rounded-2xl border p-4 transition-colors ${systemType === value ? "border-lime bg-teal/70 text-white ring-2 ring-lime/35" : "border-white/25 bg-night/55 text-cream hover:border-lime/60"}`}
                            >
                              <input
                                className="sr-only"
                                type="radio"
                                value={value}
                                {...register("systemType")}
                              />
                              <span className="block font-bold text-cream">{title}</span>
                              <span className="mt-2 block text-xs leading-5 text-cream/75">
                                {description}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                      {systemType === "hybrid" && <div>
                        <p className="mb-3 text-sm font-bold">
                          Battery backup required?
                          <sup className="ml-1 text-red-500">*</sup>
                        </p>
                        <div className="grid gap-3 sm:grid-cols-2">
                          {[
                            ["yes", "Yes, include battery backup"],
                            ["no", "No battery backup"],
                          ].map(([value, title]) => (
                            <label
                              key={value}
                              className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-4 transition-colors ${batteryRequired === value ? "border-lime bg-teal/70 text-white ring-2 ring-lime/35" : "border-white/25 bg-night/55 text-cream hover:border-lime/60"}`}
                            >
                              <input
                                className="accent-lime"
                                type="radio"
                                value={value}
                                {...register("batteryRequired")}
                              />
                              <span className="font-bold text-cream">{title}</span>
                            </label>
                          ))}
                        </div>
                       </div>}
                     </div>
                   )}
                 </div>
               </div>
              <div className="mt-10 flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  disabled={step === 0 || calculating}
                  onClick={() => setStep((current) => Math.max(0, current - 1))}
                >
                  <ArrowLeft className="mr-2 inline" size={16} />
                  Back
                </Button>
                {step < 3 ? (
                  <Button type="button" onClick={next}>
                    Continue <ArrowRight className="ml-2 inline" size={16} />
                  </Button>
                ) : (
                  <Button type="submit" disabled={isSubmitting || calculating}>
                    Calculate my savings{" "}
                    <ArrowRight className="ml-2 inline" size={16} />
                  </Button>
                )}
              </div>
              {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
            </form>
          </Card>
        </div>
      </div>
      {calculating && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink/80 p-6 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-cream p-8 text-center shadow-2xl">
            <div className="calculating-orb mx-auto grid h-20 w-20 place-items-center rounded-full bg-lime">
              <Sun className="text-teal" size={36} />
            </div>
            <h2 className="mt-6 text-2xl font-black">
              Calculating your solar savings
            </h2>
            <p className="mt-3 text-sm leading-6 text-ink/60">
              Sizing your system, estimating your subsidy, and modelling 25
              years of savings.
            </p>
            <div className="mt-6 h-2 overflow-hidden rounded-full bg-ink/10">
              <div className="calculating-progress h-full rounded-full bg-teal" />
            </div>
          </div>
        </div>
      )}
      {duplicate && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink/70 p-6">
          <div className="w-full max-w-md rounded-3xl bg-cream p-8 shadow-2xl">
            <p className="text-sm font-bold uppercase tracking-widest text-teal">
              Existing estimate found
            </p>
            <h2 className="mt-3 text-2xl font-black">
              You already have an estimate with us.
            </h2>
            <p className="mt-3 text-sm leading-6 text-ink/60">
              We found an earlier estimate for this phone number or email. Would
              you like to view it or create another estimate?
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button onClick={openExisting}>View existing estimate</Button>
              <Button
                variant="outline"
                onClick={() => {
                  const data = pendingData;
                  setDuplicate(null);
                  if (data) void submit(data, true);
                }}
              >
                Create another
              </Button>
              <button
                className="w-full text-sm text-ink/50"
                onClick={() => setDuplicate(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </main>
  );
}
const Input = ({
  label,
  error,
  wrapperClassName,
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  wrapperClassName?: string;
}) => (
  <label className={wrapperClassName}>
    <span className="mb-2 block text-sm font-bold">
      {label}
      {props.required && <sup className="ml-1 text-red-500">*</sup>}
    </span>
    <input
      className={`w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 outline-none focus:border-teal ${className ?? ""}`}
      {...props}
    />
    {error && <small className="text-red-600">{error}</small>}
  </label>
);
const Select = ({
  label,
  options,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  options: string[][];
}) => (
  <label>
    <span className="mb-2 block text-sm font-bold">
      {label}
      {props.required && <sup className="ml-1 text-red-500">*</sup>}
    </span>
    <select
      className="w-full rounded-2xl border border-ink/15 bg-white px-4 py-3"
      {...props}
    >
      {options.map(([value, text]) => (
        <option value={value} key={value}>
          {text}
        </option>
      ))}
    </select>
  </label>
);
