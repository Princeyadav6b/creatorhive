import type { Database } from "@/integrations/supabase/types";

export type AppRole = Database["public"]["Enums"]["app_role"];
export type RateType = Database["public"]["Enums"]["rate_type"];
export type BookingStatus = Database["public"]["Enums"]["booking_status"];

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Gig = Database["public"]["Tables"]["gigs"]["Row"];
export type Booking = Database["public"]["Tables"]["bookings"]["Row"];

export type GigInsert = Database["public"]["Tables"]["gigs"]["Insert"];
export type BookingInsert = Database["public"]["Tables"]["bookings"]["Insert"];
