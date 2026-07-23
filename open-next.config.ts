import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// R2 is intentionally disabled until Cloudflare billing is configured.
// The application falls back to non-persistent upload handling in this mode.
export default defineCloudflareConfig({});
