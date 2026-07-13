import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// During local scaffolding without keys set yet, this client is created
// but calls will fail gracefully until real Supabase env vars are added.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Listing = {
  id: string;
  owner_id: string;
  title: string;
  city: string;
  suburb: string;
  price_zar: number;
  room_type: string;
  description: string;
  amenities: string[];
  image_url: string | null;
  whatsapp_number: string;
  contact_email: string;
  verified: boolean;
  created_at: string;
};

export type Profile = {
  id: string;
  full_name: string;
  role: "renter" | "landlord";
  created_at: string;
};
