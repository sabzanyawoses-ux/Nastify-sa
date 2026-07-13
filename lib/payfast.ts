import crypto from "crypto";

/**
 * PayFast integration helper.
 *
 * IMPORTANT — you still need to add your real PayFast credentials once
 * your merchant account is authorized. Until then this runs in SANDBOX
 * mode against PayFast's test gateway, which is fully functional for
 * testing the checkout flow end-to-end with fake card details.
 *
 * Required env vars (see .env.example):
 *   PAYFAST_MERCHANT_ID
 *   PAYFAST_MERCHANT_KEY
 *   PAYFAST_PASSPHRASE      (optional but recommended)
 *   NEXT_PUBLIC_PAYFAST_SANDBOX=true|false
 *   NEXT_PUBLIC_SITE_URL
 */

const SANDBOX_URL = "https://sandbox.payfast.co.za/eng/process";
const LIVE_URL = "https://www.payfast.co.za/eng/process";

export type PayfastPaymentInput = {
  amount: number; // in ZAR, e.g. 1500.00
  itemName: string;
  itemDescription?: string;
  buyerEmail: string;
  buyerFirstName?: string;
  paymentId: string; // your own internal reference (order/booking id)
};

function isSandbox() {
  return process.env.NEXT_PUBLIC_PAYFAST_SANDBOX !== "false";
}

/**
 * Builds the field set PayFast expects, generates the md5 signature,
 * and returns both the target URL and the fields to POST/redirect with.
 */
export function buildPayfastPayload(input: PayfastPaymentInput) {
  const merchantId = process.env.PAYFAST_MERCHANT_ID || "10000100"; // PayFast's public sandbox merchant id
  const merchantKey = process.env.PAYFAST_MERCHANT_KEY || "46f0cd694581a"; // PayFast's public sandbox merchant key
  const passphrase = process.env.PAYFAST_PASSPHRASE || "";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const fields: Record<string, string> = {
    merchant_id: merchantId,
    merchant_key: merchantKey,
    return_url: `${siteUrl}/dashboard?payment=success`,
    cancel_url: `${siteUrl}/dashboard?payment=cancelled`,
    notify_url: `${siteUrl}/api/payfast/notify`,
    name_first: input.buyerFirstName || "Guest",
    email_address: input.buyerEmail,
    m_payment_id: input.paymentId,
    amount: input.amount.toFixed(2),
    item_name: input.itemName,
    item_description: input.itemDescription || "",
  };

  // PayFast signature: concatenate fields in the order they were set
  // (excluding empty values), url-encode, append passphrase, md5 hash.
  const pairs = Object.entries(fields)
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(([k, v]) => `${k}=${encodeURIComponent(v.toString().trim()).replace(/%20/g, "+")}`);

  let signatureString = pairs.join("&");
  if (passphrase) {
    signatureString += `&passphrase=${encodeURIComponent(passphrase.trim()).replace(/%20/g, "+")}`;
  }

  const signature = crypto.createHash("md5").update(signatureString).digest("hex");

  return {
    url: isSandbox() ? SANDBOX_URL : LIVE_URL,
    fields: { ...fields, signature },
    sandbox: isSandbox(),
  };
}

/**
 * Validates an Instant Transaction Notification (ITN) callback from PayFast.
 * Call this inside the /api/payfast/notify route before trusting the payload.
 * NOTE: full production validation should also re-check the source IP range
 * and do a server-to-server confirmation POST back to PayFast — see PayFast's
 * ITN guide. This covers the signature check, which is the essential part.
 */
export function verifyPayfastSignature(postData: Record<string, string>) {
  const passphrase = process.env.PAYFAST_PASSPHRASE || "";
  const { signature, ...rest } = postData;

  const pairs = Object.entries(rest)
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(([k, v]) => `${k}=${encodeURIComponent(v.toString().trim()).replace(/%20/g, "+")}`);

  let signatureString = pairs.join("&");
  if (passphrase) {
    signatureString += `&passphrase=${encodeURIComponent(passphrase.trim()).replace(/%20/g, "+")}`;
  }

  const expected = crypto.createHash("md5").update(signatureString).digest("hex");
  return expected === signature;
}
