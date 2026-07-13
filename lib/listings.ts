import { supabase, type Listing } from "./supabaseClient";
import { mockListings } from "./mockListings";

export async function getListings(filters?: { city?: string; query?: string }): Promise<Listing[]> {
  try {
    let q = supabase.from("listings").select("*").order("created_at", { ascending: false });
    if (filters?.city) q = q.eq("city", filters.city);
    const { data, error } = await q;
    if (error || !data || data.length === 0) throw error || new Error("empty");
    let results = data as Listing[];
    if (filters?.query) {
      const needle = filters.query.toLowerCase();
      results = results.filter(
        (l) =>
          l.title.toLowerCase().includes(needle) ||
          l.city.toLowerCase().includes(needle) ||
          l.suburb.toLowerCase().includes(needle)
      );
    }
    return results;
  } catch {
    // Supabase not configured yet, or no rows — fall back to sample data
    let results = mockListings;
    if (filters?.city) results = results.filter((l) => l.city === filters.city);
    if (filters?.query) {
      const needle = filters.query.toLowerCase();
      results = results.filter(
        (l) =>
          l.title.toLowerCase().includes(needle) ||
          l.city.toLowerCase().includes(needle) ||
          l.suburb.toLowerCase().includes(needle)
      );
    }
    return results;
  }
}

export async function getListingById(id: string): Promise<Listing | null> {
  try {
    const { data, error } = await supabase.from("listings").select("*").eq("id", id).single();
    if (error || !data) throw error || new Error("not found");
    return data as Listing;
  } catch {
    return mockListings.find((l) => l.id === id) || null;
  }
}
