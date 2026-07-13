import { NextRequest, NextResponse } from "next/server";
import { buildPayfastPayload } from "@/lib/payfast";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { amount, itemName, itemDescription, buyerEmail, buyerFirstName, paymentId } = body;

    if (!amount || !itemName || !buyerEmail || !paymentId) {
      return NextResponse.json(
        { error: "Missing required fields: amount, itemName, buyerEmail, paymentId" },
        { status: 400 }
      );
    }

    const payload = buildPayfastPayload({
      amount,
      itemName,
      itemDescription,
      buyerEmail,
      buyerFirstName,
      paymentId,
    });

    return NextResponse.json(payload);
  } catch (err) {
    return NextResponse.json({ error: "Failed to build PayFast checkout" }, { status: 500 });
  }
}
