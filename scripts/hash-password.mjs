import crypto from "node:crypto";
const password = process.argv[2];
if (!password) { console.error("Usage: node scripts/hash-password.mjs <password>"); process.exit(1); }
const iterations = 120000;
const salt = crypto.randomBytes(16);
const hash = crypto.pbkdf2Sync(password, salt, iterations, 32, "sha256");
console.log(`pbkdf2_sha256$${iterations}$${salt.toString("base64")}$${hash.toString("base64")}`);
