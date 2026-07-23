import { getCloudflareContext } from "@opennextjs/cloudflare";

export type D1DatabaseLike = { prepare(query: string): { bind(...values: unknown[]): { run(): Promise<unknown>; first<T = Record<string, unknown>>(): Promise<T | null>; all<T = Record<string, unknown>>(): Promise<{ results: T[] }> } } };
export type R2BucketLike = { put(key: string, value: ArrayBuffer, options?: Record<string, unknown>): Promise<unknown>; createMultipartUpload?: unknown };
export type RuntimeEnv = { DB?: D1DatabaseLike; BILLS_BUCKET?: R2BucketLike };
export function getEnv(): RuntimeEnv { try { return getCloudflareContext().env as RuntimeEnv; } catch { return {}; } }
