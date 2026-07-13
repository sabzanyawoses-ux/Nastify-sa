import Link from "next/link";

const cities = ["Cape Town", "Johannesburg", "Stellenbosch", "Pretoria", "Durban"];
const platform = [
  { href: "/browse", label: "Browse Rooms" },
  { href: "/list-property", label: "List Your Property" },
  { href: "/signin", label: "Sign In" },
  { href: "/signup", label: "Create Account" },
];

export default function Footer() {
  return (
    <footer className="border-t border-panelborder mt-20">
      <div className="max-w-6xl mx-auto px-5 py-14">
        <div className="font-display font-800 text-2xl mb-4">
          NASTIFY<span className="gold-text">SA</span>
        </div>
        <p className="text-white/60 max-w-md mb-8">
          Discover and lease rooms, apartments, and shared accommodation in South
          Africa&apos;s major cities.
        </p>
        <p className="text-white/40 text-sm mb-12">
          &copy; {new Date().getFullYear()} Nastify SA. All rights reserved.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-10">
          <div>
            <h4 className="text-xs tracking-widest text-white/50 mb-4">POPULAR CITIES</h4>
            <ul className="space-y-3 text-white/70">
              {cities.map((c) => (
                <li key={c}>
                  <Link href={`/browse?city=${encodeURIComponent(c)}`} className="hover:text-gold">
                    {c}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs tracking-widest text-white/50 mb-4">PLATFORM</h4>
            <ul className="space-y-3 text-white/70">
              {platform.map((p) => (
                <li key={p.href}>
                  <Link href={p.href} className="hover:text-gold">
                    {p.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs tracking-widest text-white/50 mb-4">SUPPORT &amp; TRUST</h4>
            <ul className="space-y-3 text-white/70">
              <li>support@nastify.co.za</li>
              <li>Secure PayFast Gateway</li>
              <li>
                <span className="inline-block px-3 py-1 rounded-full border border-panelborder text-xs text-white/60">
                  South African Rands (ZAR)
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
