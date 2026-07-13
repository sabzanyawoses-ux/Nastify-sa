import { NextRequest, NextResponse } from "next/server";
import { verifyPayfastSignature } from "@/lib/payfast";
import { createClient } from "@supabase/supabase-js";

// Uses the service role key server-side only, to write payment status
// regardless of RLS. Add SUPABASE_SERVICE_ROLE_KEY to your env once you
// have your Supabase project set up (see README).
function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  return createClient(url, serviceKey);
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const postData: Record<string, string> = {};
  formData.forEach((value, key) => {
    postData[key] = value.toString();
  });

  const isValid = verifyPayfastSignature(postData);

  if (!isValid) {
    console.error("PayFast ITN signature mismatch", postData);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    const supabase = getServiceClient();
    await supabase.from("payments").upsert({
      payment_id: postData.m_payment_id,
      pf_payment_id: postData.pf_payment_id,
      status: postData.payment_status,
      amount_gross: postData.amount_gross,
      raw_payload: postData,
    });
  } catch (err) {
    console.error("Failed to record PayFast payment", err);
  }

  return NextResponse.json({ received: true });
}
