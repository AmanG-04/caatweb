import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import staticAssetsIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache";

// Public marketing routes are generated at build time. Serve their cached
// output directly from Workers Static Assets instead of starting Next.js.
export default defineCloudflareConfig({
  incrementalCache: staticAssetsIncrementalCache,
  enableCacheInterception: true,
  routePreloadingBehavior: "none",
});
