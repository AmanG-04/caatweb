const ITERATIONS = 120_000;
const encode = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes));
const decode = (value: string) => Uint8Array.from(atob(value), (char) => char.charCodeAt(0));
const encodeTerminalSafe = (bytes: Uint8Array) => encode(bytes).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
const decodeTerminalSafe = (value: string) => { const base64 = value.replaceAll("-", "+").replaceAll("_", "/") + "=".repeat((4 - value.length % 4) % 4); return decode(base64); };

export async function hashPassword(password: string) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt, iterations: ITERATIONS, hash: "SHA-256" }, key, 256);
  return `pbkdf2_sha256.${ITERATIONS}.${encodeTerminalSafe(salt)}.${encodeTerminalSafe(new Uint8Array(bits))}`;
}

export async function verifyPassword(password: string, stored: string) {
  const [algorithm, iterations, saltValue, hashValue] = stored.includes(".") ? stored.split(".") : stored.split("$");
  if (algorithm !== "pbkdf2_sha256" || !iterations || !saltValue || !hashValue) return false;
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const salt = stored.includes(".") ? decodeTerminalSafe(saltValue) : decode(saltValue);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt: salt.buffer as ArrayBuffer, iterations: Number(iterations), hash: "SHA-256" }, key, 256);
  const actual = new Uint8Array(bits); const expected = stored.includes(".") ? decodeTerminalSafe(hashValue) : decode(hashValue);
  if (actual.length !== expected.length) return false;
  let difference = 0; for (let i = 0; i < actual.length; i++) difference |= actual[i] ^ expected[i];
  return difference === 0;
}
