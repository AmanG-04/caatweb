import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import crypto from "node:crypto";

const stored = process.argv[2];
if (!stored) { console.error('Usage: node scripts/verify-password.mjs "PASTE_FULL_HASH_HERE"'); process.exit(1); }
const rl = readline.createInterface({ input, output });
const password = await rl.question("Password to test: "); rl.close();
const terminalSafe = stored.includes(".");
const [algorithm, iterations, salt, expected] = terminalSafe ? stored.split(".") : stored.split("$");
const actual = crypto.pbkdf2Sync(password, Buffer.from(salt, terminalSafe ? "base64url" : "base64"), Number(iterations), 32, "sha256").toString(terminalSafe ? "base64url" : "base64");
console.log(algorithm === "pbkdf2_sha256" && actual === expected ? "MATCH" : "NO MATCH");
