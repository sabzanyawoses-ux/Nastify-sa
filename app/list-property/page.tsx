"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

const cities = ["Cape Town", "Johannesburg", "Stellenbosch", "Pretoria", "Durban"];

export default function ListPropertyPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    city: cities[0],
    suburb: "",
    price_zar: "",
    room_type: "Single room",
    description: "",
    amenities: "",
    whatsapp_number: "",
    contact_email: "",
    image_url: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function update(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;
    if (!user) {
      router.push("/signin?next=/list-property");
      return;
    }

    const { error: insertError } = await supabase.from("listings").insert({
      owner_id: user.id,
      title: form.title,
      city: form.city,
      suburb: form.suburb,
      price_zar: Number(form.price_zar),
      room_type: form.room_type,
      description: form.description,
      amenities: form.amenities.split(",").map((a) => a.trim()).filter(Boolean),
      whatsapp_number: form.whatsapp_number,
      contact_email: form.contact_email,
      image_url: form.image_url || null,
      verified: false,
    });

    setLoading(false);
    if (insertError) {
      setError(insertError.message);
      return;
    }
    router.push("/dashboard");
  }

  return (
    <div className="max-w-2xl mx-auto px-5 py-14">
      <h1 className="font-display font-800 text-3xl mb-2">List Your Room</h1>
      <p className="text-white/50 mb-8">
        New listings are reviewed before being marked &quot;Verified&quot;, but go live immediately.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          required
          placeholder="Listing title"
          value={form.title}
          onChange={(e) => update("title", e.target.value)}
          className="bg-transparent border border-panelborder rounded-lg px-4 py-3 text-sm placeholder:text-white/40 focus:border-gold outline-none"
        />

        <div className="grid grid-cols-2 gap-4">
          <select
            value={form.city}
            onChange={(e) => update("city", e.target.value)}
            className="bg-ink border border-panelborder rounded-lg px-4 py-3 text-sm focus:border-gold outline-none"
          >
            {cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <input
            required
            placeholder="Suburb"
            value={form.suburb}
            onChange={(e) => update("suburb", e.target.value)}
            className="bg-transparent border border-panelborder rounded-lg px-4 py-3 text-sm placeholder:text-white/40 focus:border-gold outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <input
            required
            type="number"
            min={0}
            placeholder="Price per month (R)"
            value={form.price_zar}
            onChange={(e) => update("price_zar", e.target.value)}
            className="bg-transparent border border-panelborder rounded-lg px-4 py-3 text-sm placeholder:text-white/40 focus:border-gold outline-none"
          />
          <select
            value={form.room_type}
            onChange={(e) => update("room_type", e.target.value)}
            className="bg-ink border border-panelborder rounded-lg px-4 py-3 text-sm focus:border-gold outline-none"
          >
            <option>Single room</option>
            <option>Studio apartment</option>
            <option>Shared house</option>
            <option>Full apartment</option>
          </select>
        </div>

        <textarea
          required
          rows={4}
          placeholder="Description"
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
          className="bg-transparent border border-panelborder rounded-lg px-4 py-3 text-sm placeholder:text-white/40 focus:border-gold outline-none"
        />

        <input
          placeholder="Amenities, comma separated (Wifi, Furnished, Parking...)"
          value={form.amenities}
          onChange={(e) => update("amenities", e.target.value)}
          className="bg-transparent border border-panelborder rounded-lg px-4 py-3 text-sm placeholder:text-white/40 focus:border-gold outline-none"
        />

        <input
          placeholder="Photo URL (optional for now)"
          value={form.image_url}
          onChange={(e) => update("image_url", e.target.value)}
          className="bg-transparent border border-panelborder rounded-lg px-4 py-3 text-sm placeholder:text-white/40 focus:border-gold outline-none"
        />

        <div className="grid grid-cols-2 gap-4">
          <input
            required
            placeholder="WhatsApp number (27...)"
            value={form.whatsapp_number}
            onChange={(e) => update("whatsapp_number", e.target.value)}
            className="bg-transparent border border-panelborder rounded-lg px-4 py-3 text-sm placeholder:text-white/40 focus:border-gold outline-none"
          />
          <input
            required
            type="email"
            placeholder="Contact email"
            value={form.contact_email}
            onChange={(e) => update("contact_email", e.target.value)}
            className="bg-transparent border border-panelborder rounded-lg px-4 py-3 text-sm placeholder:text-white/40 focus:border-gold outline-none"
          />
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button disabled={loading} className="gold-btn rounded-lg py-3 font-medium disabled:opacity-60">
          {loading ? "Publishing..." : "Publish Listing"}
        </button>
      </form>
    </div>
  );
}
