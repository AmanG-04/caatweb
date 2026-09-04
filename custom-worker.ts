// @ts-ignore - Generated at build time by opennextjs-cloudflare
import { default as nextHandler } from "./.open-next/worker.js";
import type { D1Database, R2Bucket, ScheduledController, ExecutionContext } from "@cloudflare/workers-types";

interface Env {
  DB: D1Database;
  BILLS_BUCKET: R2Bucket;
  AUTH_MODE: string;
  ADMIN_LOGIN_ID: string;
  ADMIN_LOGIN_PASSWORD: string;
  NEXT_PUBLIC_SITE_URL: string;
  RESEND_API_KEY: string;
  ADMIN_EMAIL: string;
}

type LeadDigestItem = {
  id: string;
  name: string;
  phone: string;
  email: string;
  created_at: string;
};

export default {
  // Pass all standard website requests to OpenNext
  fetch: nextHandler.fetch,

  // Handle the daily 12:00 AM IST scheduled event.
  async scheduled(controller: ScheduledController, env: Env, ctx: ExecutionContext) {
    console.log(`Cron job started at: ${new Date(controller.scheduledTime).toISOString()}`);

    if (!env.DB) {
      console.error("Scheduled cron task failed: D1 database binding is unavailable.");
      return;
    }

    if (!env.RESEND_API_KEY) {
      console.error("Scheduled cron task failed: RESEND_API_KEY is not configured.");
      return;
    }

    ctx.waitUntil((async () => {
      try {
      const newLeads = await env.DB.prepare(
        "SELECT id, name, phone, email, created_at FROM leads WHERE datetime(created_at) >= datetime('now', '-1 day') ORDER BY datetime(created_at) DESC"
      )
        .all<LeadDigestItem>();

      console.log(`Total new leads since yesterday: ${newLeads.results.length}`);

      // Always send email digest (with leads or no-leads notification) via Resend
      await sendLeadDigestEmail(env, newLeads.results);
      } catch (error) {
        console.error("Scheduled cron task failed:", error);
      }
    })());
  },
};

async function sendLeadDigestEmail(env: Env, leads: LeadDigestItem[]) {
  const timestamp = new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "short",
  });

  let leadItems = "";
  let subject = "";

  if (leads.length > 0) {
    leadItems = leads
      .map(
        (lead) =>
          `- ${lead.name} (${lead.email}, ${lead.phone}) — submitted ${new Date(
            lead.created_at
          ).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium" })}`
      )
      .join("\n");
    subject = `${leads.length} new lead(s) — CAAT PowerBot`;
  } else {
    leadItems = "No new leads submitted in the past 24 hours.";
    subject = "No new leads — CAAT PowerBot";
  }

  // Send via Resend API to multiple recipients
  const recipients = ["tushar0408@gmail.com", "10amangupta04@gmail.com"];

  const apiResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: "CAAT PowerBot <onboarding@resend.com>",
      to: recipients,
      subject,
      html: `
        <h2>Daily Lead Digest — ${timestamp}</h2>
        <p>${leadItems}</p>
        ${leads.length > 0 ? `<p>Total new leads since yesterday: ${leads.length}</p>` : ""}
        <p>Sent from CAAT PowerBot administration dashboard.</p>
      `,
    }),
  });

  if (!apiResponse.ok) {
    const errorText = await apiResponse.text();
    console.error("Resend API error:", {
      status: apiResponse.status,
      body: errorText,
    });
    throw new Error(`Resend API failed: ${errorText}`);
  }

  const response = await apiResponse.json();
  console.log("Lead digest email sent:", response.id, `| leads: ${leads.length}`);
}
