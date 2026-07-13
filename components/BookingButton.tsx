"use client";

import { useState } from "react";
import type { Listing } from "@/lib/supabaseClient";
import { supabase } from "@/lib/supabaseClient";

export default function BookingButton({ listing }: { listing: Listing }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const depositAmount = Math.round(listing.price_zar * 0.1); // 10% refundable deposit

  async function handleBook() {
    setLoading(true);
    setError(null);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const email = userData?.user?.email;

      if (!email) {
        window.location.href = `/signin?next=/listing/${listing.id}`;
        return;
      }

      const paymentId = `${listing.id}-${Date.now()}`;
      const res = await fetch("/api/payfast/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: depositAmount,
          itemName: `Deposit — ${listing.title}`,
          itemDescription: "Refundable viewing deposit via Nastify SA",
          buyerEmail: email,
          buyerFirstName: userData?.user?.user_metadata?.full_name || "Guest",
          paymentId,
        }),
      });

      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || "Could not start checkout");

      // Build and submit a form to redirect to PayFast with the signed fields
      const form = document.createElement("form");
      form.method = "POST";
      form.action = payload.url;
      Object.entries(payload.fields).forEach(([key, value]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = value as string;
        form.appendChild(input);
      });
      document.body.appendChild(form);
      form.submit();
    } catch (err: any) {
      setError(err.message || "Something went wrong starting checkout.");
      setLoading(false);
    }
  }

  return (
    <div>
      <button onClick={handleBook} disabled={loading} className="w-full gold-btn rounded-lg py-3 font-medium disabled:opacity-60">
        {loading ? "Redirecting to PayFast..." : `Pay R${depositAmount.toLocaleString("en-ZA")} deposit`}
      </button>
      {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
      <p className="text-white/30 text-[11px] mt-2">
        Runs in PayFast sandbox mode until live merchant credentials are added.
      </p>
    </div>
  );
}
