import { getListings } from "@/lib/listings";
import RoomCard from "@/components/RoomCard";

const cities = ["Cape Town", "Johannesburg", "Stellenbosch", "Pretoria", "Durban"];

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: { q?: string; city?: string };
}) {
  const listings = await getListings({ query: searchParams.q, city: searchParams.city });

  return (
    <div className="max-w-6xl mx-auto px-5 py-14">
      <h1 className="font-display font-800 text-3xl mb-2">Browse Rooms</h1>
      <p className="text-white/50 mb-8">
        {listings.length} listing{listings.length === 1 ? "" : "s"} found
        {searchParams.city ? ` in ${searchParams.city}` : ""}
      </p>

      <form className="flex flex-col sm:flex-row gap-3 mb-6" action="/browse">
        <input
          name="q"
          defaultValue={searchParams.q}
          placeholder="Search by city, suburb, or room title..."
          className="flex-1 bg-transparent border border-panelborder rounded-full px-5 py-3 text-sm placeholder:text-white/40 focus:border-gold outline-none"
        />
        <button className="gold-btn rounded-full px-6 py-3 text-sm font-medium">Search</button>
      </form>

      <div className="flex flex-wrap gap-2 mb-10">
        <a
          href="/browse"
          className={`px-4 py-2 rounded-full text-sm border ${
            !searchParams.city ? "gold-btn border-transparent" : "outline-btn"
          }`}
        >
          All cities
        </a>
        {cities.map((c) => (
          <a
            key={c}
            href={`/browse?city=${encodeURIComponent(c)}`}
            className={`px-4 py-2 rounded-full text-sm border ${
              searchParams.city === c ? "gold-btn border-transparent" : "outline-btn"
            }`}
          >
            {c}
          </a>
        ))}
      </div>

      {listings.length === 0 ? (
        <div className="panel rounded-2xl p-10 text-center text-white/50">
          No listings match your search yet. Try a different city or check back soon.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((l) => (
            <RoomCard key={l.id} listing={l} />
          ))}
        </div>
      )}
    </div>
  );
}
