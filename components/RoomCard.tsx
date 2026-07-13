import Link from "next/link";
import type { Listing } from "@/lib/supabaseClient";

export default function RoomCard({ listing }: { listing: Listing }) {
  const waLink = `https://wa.me/${listing.whatsapp_number.replace(/\D/g, "")}?text=${encodeURIComponent(
    `Hi, I'm interested in "${listing.title}" on Nastify SA.`
  )}`;

  return (
    <div className="panel rounded-2xl overflow-hidden flex flex-col group">
      <Link href={`/listing/${listing.id}`} className="block relative aspect-[4/3] bg-panelborder overflow-hidden">
        {listing.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={listing.image_url}
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/30 text-sm">
            No photo yet
          </div>
        )}
        {listing.verified && (
          <span className="absolute top-3 left-3 bg-ink/80 text-gold text-xs px-2.5 py-1 rounded-full border border-gold/40">
            Verified
          </span>
        )}
      </Link>

      <div className="p-5 flex flex-col gap-2 flex-1">
        <Link href={`/listing/${listing.id}`}>
          <h3 className="font-display font-700 text-lg leading-snug hover:text-gold transition-colors">
            {listing.title}
          </h3>
        </Link>
        <p className="text-white/50 text-sm">
          {listing.suburb}, {listing.city}
        </p>
        <p className="font-mono text-gold text-lg mt-1">
          R{listing.price_zar.toLocaleString("en-ZA")}
          <span className="text-white/40 text-sm"> /month</span>
        </p>

        <div className="mt-auto pt-4 flex gap-2">
          <Link
            href={`/listing/${listing.id}`}
            className="flex-1 text-center outline-btn rounded-lg py-2 text-sm font-medium"
          >
            View details
          </Link>
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-center gold-btn rounded-lg py-2 text-sm"
          >
            WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
