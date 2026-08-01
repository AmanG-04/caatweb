"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import {
  quoteFormSchema,
  type QuoteFormData,
  type QuoteFormInput,
} from "@/lib/validation";
import { Button, Card } from "@/components/ui";
import { ArrowLeft, ArrowRight, Check, Sun, Upload } from "lucide-react";

const labels = [
  "About you",
  "Your property",
  "System preference",
  "Your energy",
];
const ranges = [
  ["name", "phone", "email", "address", "city", "state", "pincode"],
  ["propertyType", "roofType", "ownership"],
  ["systemType", "batteryRequired"],
  ["monthlyUnits", "pricePerUnit", "provider"],
] as const;
type Duplicate = {
  id: string;
  name: string;
  createdAt: string;
  result: Record<string, unknown>;
};

type ApiResult = {
  success?: boolean;
  data?: { objectKey?: string; quote?: { id?: string } & Record<string, unknown> };
  error?: { code?: string; message?: string; existingQuote?: Duplicate };
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
  const [sitePhoto, setSitePhoto] = useState<File | null>(null);
  const [calculating, setCalculating] = useState(false);
  const [error, setError] = useState("");
  const [duplicate, setDuplicate] = useState<Duplicate | null>(null);
  const [pendingData, setPendingData] = useState<QuoteFormData | null>(null);
  const router = useRouter();
  const {
    register,
    handleSubmit,
    trigger,
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
  const next = async () => {
    const valid = await trigger(ranges[step]);
    if (valid) setStep((current) => Math.min(3, current + 1));
    else setValidatedStep(step);
  };
  const fieldError = (field: keyof QuoteFormData) =>
    validatedStep === step ? errors[field]?.message : undefined;
  const submit = async (data: QuoteFormData, allowDuplicate = false) => {
    setCalculating(true);
    setError("");
    try {
      if (!file) throw new Error("Please upload your electricity bill.");
      let billObjectKey: string | undefined;
      let sitePhotoObjectKey: string | undefined;
      {
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
        billObjectKey = uploadResult.data.objectKey;
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
          billObjectKey,
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
    <main className="quote-flow relative min-h-screen overflow-hidden py-8">
      <div className="relative z-10">
      <div className="container-wide">
        <div className="flex items-center justify-between gap-4">
          <a href="/" className="text-lg font-black">
            CAAT PowerBot <span className="text-teal">LLP</span>
          </a>
          <span className="text-xs font-bold uppercase tracking-[.14em] text-ink/50">Solar savings estimate</span>
        </div>
        <div className="mx-auto max-w-2xl py-16">
          <div className="mb-10 flex min-h-8 items-center justify-between" aria-label={`Step ${step + 1} of ${labels.length}: ${labels[step]}`}>
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
                    ? "Let’s start with the basics."
                    : step === 1
                      ? "A little context helps us size your system."
                      : step === 2
                        ? "Choose the system that fits your property and backup needs."
                        : "Your energy use is the key to better savings."}
                </p>
                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  {step === 0 && (
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
                        {...register("pincode")}
                      />
                    </>
                  )}
                  {step === 1 && (
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
                  {step === 2 && (
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
                              className="cursor-pointer rounded-2xl border border-ink/15 bg-white p-4 has-[:checked]:border-teal has-[:checked]:ring-2 has-[:checked]:ring-teal/15"
                            >
                              <input
                                className="sr-only"
                                type="radio"
                                value={value}
                                {...register("systemType")}
                              />
                              <span className="block font-bold">{title}</span>
                              <span className="mt-2 block text-xs leading-5 text-ink/55">
                                {description}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                      <div>
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
                              className="flex cursor-pointer items-center gap-3 rounded-2xl border border-ink/15 bg-white p-4 has-[:checked]:border-teal has-[:checked]:ring-2 has-[:checked]:ring-teal/15"
                            >
                              <input
                                className="accent-teal"
                                type="radio"
                                value={value}
                                {...register("batteryRequired")}
                              />
                              <span className="font-bold">{title}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  {step === 3 && (
                    <>
                      <Input
                        required
                        type="number"
                        label="Average monthly units"
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
                        error={fieldError("provider")}
                        {...register("provider")}
                      />
                      <label className="sm:col-span-2">
                        <span className="mb-2 block text-sm font-bold">
                          Upload electricity bill
                          <sup className="ml-1 text-red-500">*</sup>
                        </span>
                        <span className="flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-ink/20 p-5 text-sm text-ink/60">
                          <Upload size={20} />
                          {file ? file.name : "PDF, PNG or JPEG up to 10MB"}
                          <input
                            className="hidden"
                            type="file"
                            accept="application/pdf,image/png,image/jpeg"
                            onChange={(event) =>
                              setFile(event.target.files?.[0] ?? null)
                            }
                          />
                        </span>
                      </label>
                    </>
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
