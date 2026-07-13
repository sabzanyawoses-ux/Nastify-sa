"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase, type Listing, type Profile } from "@/lib/supabaseClient";

export default function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [myListings, setMyListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const paymentStatus = searchParams.get("payment");

  useEffect(() => {
    async function load() {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;
      if (!user) {
        router.push("/signin?next=/dashboard");
        return;
      }

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      setProfile(profileData as Profile);

      const { data: listingsData } = await supabase
        .from("listings")
        .select("*")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false });
      setMyListings((listingsData as Listing[]) || []);

      setLoading(false);
    }
    load();
  }, [router]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/");
  }

  if (loading) {
    return <div className="max-w-5xl mx-auto px-5 py-20 text-white/50">Loading your dashboard...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-5 py-14">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="font-display font-800 text-3xl mb-1">
            Welcome{profile?.full_name ? `, ${profile.full_name}` : ""}
          </h1>
          <p className="text-white/50 text-sm">
            {profile?.role === "landlord" ? "Landlord dashboard" : "Renter dashboard"}
          </p>
        </div>
        <button onClick={handleSignOut} className="outline-btn rounded-lg px-4 py-2 text-sm">
          Sign out
        </button>
      </div>

      {paymentStatus === "success" && (
        <div className="panel border-gold/40 rounded-xl p-4 mb-8 text-gold text-sm">
          Payment completed — the host will be in touch shortly.
        </div>
      )}
      {paymentStatus === "cancelled" && (
        <div className="panel rounded-xl p-4 mb-8 text-white/60 text-sm">
          Payment was cancelled. You can try again from the listing page anytime.
        </div>
      )}

      {profile?.role === "landlord" ? (
        <>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display font-700 text-xl">Your Listings</h2>
            <Link href="/list-property" className="gold-btn rounded-lg px-4 py-2 text-sm">
              + Add Listing
            </Link>
          </div>

          {myListings.length === 0 ? (
            <div className="panel rounded-2xl p-10 text-center text-white/50">
              You haven&apos;t listed a room yet.{" "}
              <Link href="/list-property" className="text-gold hover:underline">
                Create your first listing
              </Link>
              .
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-5">
              {myListings.map((l) => (
                <div key={l.id} className="panel rounded-xl p-5">
                  <h3 className="font-display font-700 mb-1">{l.title}</h3>
                  <p className="text-white/50 text-sm mb-2">
                    {l.suburb}, {l.city}
                  </p>
                  <p className="font-mono text-gold">R{l.price_zar.toLocaleString("en-ZA")}/mo</p>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="panel rounded-2xl p-10 text-center text-white/50">
          Saved listings and enquiry history will appear here as you browse.{" "}
          <Link href="/browse" className="text-gold hover:underline">
            Browse rooms
          </Link>
          .
        </div>
      )}
    </div>
  );
}
