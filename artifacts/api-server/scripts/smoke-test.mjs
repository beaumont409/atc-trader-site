/**
 * Post-deploy smoke test for lead email delivery.
 *
 * Usage:
 *   pnpm --filter @workspace/api-server smoke-test
 *   # or against a specific URL:
 *   API_URL=https://your-domain.com pnpm --filter @workspace/api-server smoke-test
 *
 * What it does:
 *   1. POSTs a clearly-marked test lead to POST /api/leads
 *   2. Asserts an HTTP 201 response (API accepted the lead)
 *   3. Prints a reminder to verify "Lead email sent" in the server logs
 *
 * The "Lead email sent" log entry (logged by sendLeadEmail in lib/email.ts)
 * is the authoritative signal that the Gmail transporter is configured and
 * working in the deployed environment.
 *
 * Exit codes:
 *   0 — API returned 201; check server logs for "Lead email sent"
 *   1 — unexpected HTTP status or network error
 */

const API_URL = process.env.API_URL ?? "http://localhost:" + (process.env.PORT ?? "3000");

const testLead = {
  name: "[SMOKE TEST] Do Not Contact",
  phone: "000-000-0000",
  location: "Smoke Test, TX",
  year: "2000",
  model: "Smoke Test Model",
  condition: "Excellent",
  askingPrice: "$0",
  notes: "Automated smoke test — safe to ignore",
};

async function run() {
  const endpoint = `${API_URL}/api/leads`;
  console.log(`\n🔥 Smoke test: POST ${endpoint}`);

  let res;
  try {
    res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(testLead),
    });
  } catch (err) {
    console.error(`❌ Network error reaching ${endpoint}:`, err);
    process.exit(1);
  }

  const body = await res.json().catch(() => ({}));

  if (res.status !== 201) {
    console.error(`❌ Expected HTTP 201, got ${res.status}`);
    console.error("   Response body:", JSON.stringify(body));
    process.exit(1);
  }

  console.log(`✅ HTTP 201 received — lead accepted by API`);
  console.log(`\n📋 Next step: verify the server logs contain:`);
  console.log(`   "Lead email sent"`);
  console.log(`\n   If that line is absent, check:`);
  console.log(`   • GMAIL_ADDRESS secret is set in the deployment environment`);
  console.log(`   • GMAIL_APP_PASSWORD secret is set in the deployment environment`);
  console.log(`   • The Gmail account has not revoked the app password`);
}

run();
