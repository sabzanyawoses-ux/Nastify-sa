import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";

export const supabase = createClient(supabaseUrl, supabasePublishableKey);

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
