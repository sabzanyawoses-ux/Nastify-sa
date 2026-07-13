import { getListingById } from "@/lib/listings";
import { notFound } from "next/navigation";
import BookingButton from "@/components/BookingButton";

export default async function ListingDetailPage({ params }: { params: { id: string } }) {
  const listing = await getListingById(params.id);
  if (!listing) return notFound();

  const waLink = `https://wa.me/${listing.whatsapp_number.replace(/\D/g, "")}?text=${encodeURIComponent(
    `Hi, I'm interested in "${listing.title}" on Nastify SA.`
  )}`;

  return (
    <div className="max-w-5xl mx-auto px-5 py-14">
      <div className="aspect-[16/9] rounded-2xl overflow-hidden bg-panelborder mb-8">
        {listing.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={listing.image_url} alt={listing.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/30">No photo yet</div>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-10">
        <div className="md:col-span-2">
          {listing.verified && (
            <span className="inline-block mb-3 bg-ink text-gold text-xs px-2.5 py-1 rounded-full border border-gold/40">
              Verified listing
            </span>
          )}
          <h1 className="font-display font-800 text-3xl mb-2">{listing.title}</h1>
          <p className="text-white/50 mb-6">
            {listing.suburb}, {listing.city} &middot; {listing.room_type}
          </p>
          <p className="text-white/75 leading-relaxed mb-8">{listing.description}</p>

          <h3 className="font-display font-700 mb-3">Amenities</h3>
          <ul className="grid grid-cols-2 gap-2 text-white/70 text-sm mb-10">
            {listing.amenities.map((a) => (
              <li key={a} className="flex items-center gap-2">
                <span className="text-gold">&#10003;</span> {a}
              </li>
            ))}
          </ul>
        </div>

        <aside className="panel rounded-2xl p-6 h-fit sticky top-24">
          <p className="font-mono text-gold text-2xl">
            R{listing.price_zar.toLocaleString("en-ZA")}
            <span className="text-white/40 text-base"> /month</span>
          </p>

          <a href={waLink} target="_blank" rel="noopener noreferrer" className="block text-center gold-btn rounded-lg py-3 mt-5 font-medium">
            Contact via WhatsApp
          </a>
          <a
            href={`mailto:${listing.contact_email}?subject=${encodeURIComponent(
              "Enquiry: " + listing.title
            )}`}
            className="block text-center outline-btn rounded-lg py-3 mt-3 font-medium"
          >
            Contact via Email
          </a>

          <div className="border-t border-panelborder mt-6 pt-6">
            <p className="text-white/50 text-xs mb-3">
              Secure a viewing with a refundable deposit via PayFast.
            </p>
            <BookingButton listing={listing} />
          </div>
        </aside>
      </div>
    </div>
  );
}
