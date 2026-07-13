import Link from "next/link";
import { getListings } from "@/lib/listings";
import RoomCard from "@/components/RoomCard";

const cities = ["Cape Town", "Johannesburg", "Stellenbosch", "Pretoria"];

export default async function HomePage() {
  const listings = (await getListings()).slice(0, 6);

  return (
    <div>
      {/* Hero */}
      <section className="max-w-6xl mx-auto px-5 pt-16 pb-10 text-center">
        <span className="inline-flex items-center gap-2 border border-gold/40 text-gold text-xs tracking-wide px-4 py-2 rounded-full">
          ✦ DISCOVER PREMIUM LIVING SPACE
        </span>

        <h1 className="font-display font-800 text-4xl md:text-6xl leading-tight mt-6">
          Find Your Dream Room in
          <br />
          <span className="gold-text">South Africa</span>
        </h1>

        <p className="text-white/60 max-w-xl mx-auto mt-6">
          Browse verified listings, view real photos, and connect directly with
          hosts on WhatsApp or email — no middlemen, no commission.
        </p>

        <form
          action="/browse"
          className="mt-8 max-w-xl mx-auto flex flex-col gap-3"
        >
          <input
            name="q"
            placeholder="Search by city, suburb, or room title..."
            className="w-full bg-transparent border border-panelborder rounded-full px-5 py-4 text-sm placeholder:text-white/40 focus:border-gold outline-none"
          />
          <button type="submit" className="gold-btn rounded-full py-4 font-display">
            Search Now
          </button>
        </form>

        <p className="text-white/40 text-sm mt-6">
          {cities.join(" \u00A0\u2022\u00A0 ")}
        </p>
      </section>

      {/* Two CTA cards */}
      <section className="max-w-6xl mx-auto px-5 grid md:grid-cols-2 gap-6 mt-12">
        <div className="panel rounded-2xl p-8">
          <h2 className="font-display font-700 text-2xl mb-3">Looking for a Place to Stay?</h2>
          <p className="text-white/60 mb-6">
            Discover single rooms, studios, and shared houses. Filter by price,
            amenities, and location.
          </p>
          <Link href="/browse" className="inline-block gold-btn rounded-lg px-6 py-3 font-medium">
            Browse Rooms
          </Link>
        </div>

        <div className="rounded-2xl p-8 border border-gold/60 shadow-[0_0_30px_-10px_rgba(212,175,55,0.4)]">
          <h2 className="font-display font-700 text-2xl mb-3 gold-text">List Your Room Today</h2>
          <p className="text-white/70 mb-6">
            Reach renters across South Africa. Set up your listing and start
            receiving WhatsApp and email enquiries in minutes.
          </p>
          <Link href="/list-property" className="inline-block gold-btn rounded-lg px-6 py-3 font-medium">
            Start Listing
          </Link>
        </div>
      </section>

      {/* Latest listings */}
      <section className="max-w-6xl mx-auto px-5 mt-20">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="font-display font-700 text-2xl">Latest Room Listings</h2>
            <p className="text-white/50 text-sm mt-1">Newly posted rentals in South Africa</p>
          </div>
          <Link href="/browse" className="text-gold text-sm hover:underline">
            See All &rarr;
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((l) => (
            <RoomCard key={l.id} listing={l} />
          ))}
        </div>
      </section>

      {/* Why Nastify SA */}
      <section className="max-w-6xl mx-auto px-5 mt-24 text-center">
        <h2 className="font-display font-700 text-3xl mb-14">Why Nastify SA?</h2>
        <div className="grid md:grid-cols-3 gap-10">
          {[
            {
              title: "Direct Lead Channels",
              body: "Connect directly through WhatsApp and Email. No commissions, no middle-men.",
            },
            {
              title: "Secure Payments",
              body: "PayFast handles payments with 3D-Secure cards, Instant EFT, and Capitec Pay.",
            },
            {
              title: "Listing Verification",
              body: "We review reports and flag scam postings to keep listings authentic.",
            },
          ].map((f) => (
            <div key={f.title}>
              <div className="w-14 h-14 rounded-full border border-gold flex items-center justify-center mx-auto mb-5 text-gold text-xl">
                ✓
              </div>
              <h3 className="font-display font-700 text-lg mb-2">{f.title}</h3>
              <p className="text-white/60 text-sm max-w-xs mx-auto">{f.body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
