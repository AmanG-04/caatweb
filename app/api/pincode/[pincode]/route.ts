import { NextResponse } from "next/server";
import { consumeRateLimit } from "@/lib/rate-limit";

type IndiaPostOffice = {
  District?: string | null;
  State?: string | null;
  DeliveryStatus?: string | null;
};

type IndiaPostResponse = Array<{
  Status?: string;
  PostOffice?: IndiaPostOffice[] | null;
}>;

export async function GET(request: Request, { params }: { params: Promise<{ pincode: string }> }) {
  const { pincode } = await params;
  if (!/^[1-9]\d{5}$/.test(pincode)) {
    return NextResponse.json({ success: false, error: { code: "INVALID_PINCODE", message: "Enter a valid six-digit PIN code." } }, { status: 400 });
  }

  const limit = await consumeRateLimit(request, "pincode-lookup", 30, 600);
  if (!limit.allowed) {
    return NextResponse.json({ success: false, error: { code: "RATE_LIMITED", message: "Please wait a moment before trying another PIN code." } }, { status: 429, headers: { "Retry-After": String(Math.max(1, limit.reset - Math.ceil(Date.now() / 1000))) } });
  }

  try {
    const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(8_000),
    });
    if (!response.ok) throw new Error(`India Post lookup returned ${response.status}`);
    const payload = await response.json() as IndiaPostResponse;
    const offices = payload[0]?.Status === "Success" ? payload[0].PostOffice : undefined;
    const office = offices?.find((item) => item.DeliveryStatus === "Delivery") ?? offices?.[0];
    const city = office?.District?.trim();
    const state = office?.State?.trim();

    if (!city || !state) {
      return NextResponse.json({ success: false, error: { code: "PINCODE_NOT_FOUND", message: "We could not find a city and state for this PIN code. Please enter them manually." } }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: { city, state } }, { headers: { "Cache-Control": "public, max-age=86400, s-maxage=604800" } });
  } catch (error) {
    console.error("pincode_lookup_failed", { pincode, error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ success: false, error: { code: "PINCODE_LOOKUP_UNAVAILABLE", message: "City and state lookup is temporarily unavailable. Please enter them manually." } }, { status: 503 });
  }
}
