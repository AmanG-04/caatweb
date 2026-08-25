/** Deterministic heuristics for extracting fields from Indian electricity bill text. */

export type ExtractedBillFields = {
  provider: string | null;
  consumerName: string | null;
  monthlyUnits: number | null;
  pricePerUnit: number | null;
  billingMonth: string | null;
};

export const EMPTY_BILL_FIELDS: ExtractedBillFields = {
  provider: null,
  consumerName: null,
  monthlyUnits: null,
  pricePerUnit: null,
  billingMonth: null,
};

export const UNITS_RANGE = { min: 1, max: 100000 };
export const TARIFF_RANGE = { min: 0.5, max: 100 };

const KNOWN_PROVIDERS: Array<[string, RegExp]> = [
  ["BSES Rajdhani Power", /brpl|bses\s*rajdhani/i],
  ["BSES Yamuna Power", /bypl|bses\s*yamuna/i],
  ["Tata Power Delhi Distribution", /tata\s*power\s*delhi|tpddl|ndpl/i],
  ["Adani Electricity Mumbai", /adani\s*electricity/i],
  ["Torrent Power", /torrent\s*power/i],
  ["Dakshinanchal Vidyut Vitran Nigam", /dakshinanchal|dvvnl/i],
  ["Purvanchal Vidyut Vitran Nigam", /purvanchal\s*vidyut|pvvnl/i],
  ["Madhyanchal Vidyut Vitran Nigam", /madhyanchal|mvvnl/i],
  ["Paschimanchal Vidyut Vitran Nigam", /paschimanchal/i],
  ["Noida Power Company", /noida\s*power\s*company|npcl/i],
  ["Uttar Pradesh Power Corporation", /uppcl/i],
  ["Dakshin Haryana Bijli Vitran Nigam", /dhbvn|dakshin\s*haryana/i],
  ["Uttar Haryana Bijli Vitran Nigam", /uhbvn|uttar\s*haryana/i],
  ["North Bihar Power Distribution", /nbpdcl/i],
  ["South Bihar Power Distribution", /sbpdcl/i],
  ["Bihar State Power Holding", /bsphcl/i],
  ["Jharkhand Bijli Vitran Nigam", /jbvnl|jharkhand\s*bijli/i],
  ["Central Power Distribution Company of Telangana", /tsspdcl/i],
  ["Northern Power Distribution Company of Telangana", /tsnpdcl/i],
  ["Bangalore Electricity Supply Company", /bescom/i],
  ["Calcutta Electric Supply Corporation", /cesc\b/i],
  ["West Bengal State Electricity Distribution", /wbsedcl/i],
  ["Maharashtra State Electricity Distribution", /msedcl|maha?vitaran/i],
  ["Gujarat Urja Vikas Nigam", /guvnl/i],
  ["Dakshin Gujarat Vij Company", /dgvcl/i],
];

const NUMBER_PATTERN = /-?\d[\d,]*(?:\.\d+)?/g;

function parseNumber(raw: string): number | null {
  const value = Number(raw.replaceAll(",", "").trim());
  return Number.isFinite(value) ? value : null;
}

function sanitizeUnits(value: number): number | null {
  return value >= UNITS_RANGE.min && value <= UNITS_RANGE.max ? Math.round(value) : null;
}

function sanitizeTariff(value: number): number | null {
  return value >= TARIFF_RANGE.min && value <= TARIFF_RANGE.max ? Number(value.toFixed(2)) : null;
}

function numbersIn(line: string): number[] {
  const matches = line.match(NUMBER_PATTERN) ?? [];
  return matches.map((match) => parseNumber(match)).filter((value): value is number => value !== null);
}

function matchProvider(text: string): string | null {
  for (const [label, pattern] of KNOWN_PROVIDERS) {
    if (pattern.test(text)) return label;
  }
  const generic = text.match(/([A-Z][A-Za-z&.\s]{6,70})(?:Electricity|Power|Vidyut|Bijli)[A-Za-z\s]*(?:Limited|Ltd|Corporation|Company|Board|Nigam)/);
  return generic ? generic[0].replaceAll(/\s+/g, " ").trim().slice(0, 90) : null;
}

function extractUnits(lines: string[]): number | null {
  const strongPattern = /units?\b|\bkwh\b|kw\s*h|consum(ed|ption|es)\b/i;
  const excludePattern = /reading|sanction|connect(?:ed|ion)?|load|demand|fixed|arrear|surcharge|subsidy|meters?\s*no\.?|accounts?\s*no\.?|consumers?\s*no\.?|customer\s*id|due\s*date|bill\s*no\.?/i;

  let weakCandidate: number | null = null;
  for (const line of lines) {
    if (!strongPattern.test(line) || excludePattern.test(line)) continue;
    const labeledOnly = line.replace(/^[^:\-–]*[:\-–]/, "");
    const candidates = numbersIn(labeledOnly.length > 0 ? labeledOnly : line);
    for (const value of candidates) {
      const units = sanitizeUnits(value);
      if (units === null) continue;
      if (/consum(ed|ption|es)?\b|billed|used/i.test(line)) return units;
      if (weakCandidate === null) weakCandidate = units;
      break;
    }
  }
  return weakCandidate;
}

function extractTariff(lines: string[], units: number | null): number | null {
  for (const line of lines) {
    if (!/(rate|tariff|price)/i.test(line)) continue;
    if (/(fixed|demand|charge|rental|arrears?|delay|penalt)/i.test(line)) continue;
    if (!/(per\s*unit|\/\s*unit|per\s*kwh|\/\s*kwh|unit\b|kwh)/i.test(line)) continue;
    for (let index = numbersIn(line).length - 1; index >= 0; index -= 1) {
      const tariff = sanitizeTariff(numbersIn(line)[index]);
      if (tariff !== null) return tariff;
    }
  }
  if (units) {
    for (const line of lines) {
      if (!/(total|net|gross)/i.test(line) || !/(amount|payable|due)/i.test(line)) continue;
      if (/(arrear|instal?ment|deposit|security)/i.test(line)) continue;
      const candidates = numbersIn(line);
      if (candidates.length === 0) continue;
      const implied = sanitizeTariff(candidates[candidates.length - 1] / units);
      if (implied !== null) return implied;
    }
  }
  return null;
}

function extractConsumerName(text: string): string | null {
  const match = text.match(/(?:consumer\s*name|customer\s*name|name\s*of\s*consumer|bill\s*to)\s*[:\-–]?\s*([A-Za-z][A-Za-z \t.&']{2,60})/i);
  if (!match) return null;
  return match[1].replaceAll(/\s+/g, " ").trim().slice(0, 80) || null;
}

function extractBillingMonth(text: string): string | null {
  const patterns = [
    /bill(?:ing)?\s*(?:month|period)\s*[:\-–]?\s*((?:[A-Za-z]{3,9}[\s,'-]*\d{2,4})(?:\s*(?:to|-|–)\s*(?:[A-Za-z]{3,9}[\s,'-]*\d{2,4}))?)/i,
    /bill(?:ing)?\s*(?:month|period)\s*[:\-–]?\s*((?:\d{1,2}[\s/-][A-Za-z]{3,9}[\s/-]\d{2,4})(?:\s*to\s*\d{1,2}[\s/-][A-Za-z]{3,9}[\s/-]\d{2,4})?)/i,
    /period\s*of\s*supply\s*[:\-–]?\s*((?:\d{1,2}[\s/-][A-Za-z0-9]{3,9}[\s/-]\d{2,4})(?:\s*to\s*\d{1,2}[\s/-][A-Za-z0-9]{3,9}[\s/-]\d{2,4})?)/i,
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[1].replaceAll(/\s+/g, " ").trim().slice(0, 60);
  }
  return null;
}

export function extractBillFieldsFromText(rawText: string): ExtractedBillFields {
  const text = rawText.replace(/\r/g, "").slice(0, 200_000);
  const lines = text.split("\n");
  const monthlyUnits = extractUnits(lines);
  return {
    provider: matchProvider(text),
    consumerName: extractConsumerName(text),
    monthlyUnits,
    pricePerUnit: extractTariff(lines, monthlyUnits),
    billingMonth: extractBillingMonth(text),
  };
}

export function hasHighConfidence(fields: ExtractedBillFields): boolean {
  return fields.monthlyUnits !== null && fields.pricePerUnit !== null;
}
