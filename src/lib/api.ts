import { supabase } from "@/integrations/supabase/client";
import type { Booking, BookingStatus, Gig } from "./types";

export const gigKeys = {
  all: ["gigs"] as const,
  active: ["gigs", "active"] as const,
  byId: (id: string) => ["gigs", "detail", id] as const,
  mine: (creatorId: string) => ["gigs", "mine", creatorId] as const,
};

export const bookingKeys = {
  client: (clientId: string) => ["bookings", "client", clientId] as const,
  creator: (creatorId: string) => ["bookings", "creator", creatorId] as const,
  byId: (id: string) => ["bookings", "detail", id] as const,
};

export async function fetchActiveGigs(): Promise<Gig[]> {
  const { data, error } = await supabase
    .from("gigs")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function fetchGig(id: string): Promise<Gig | null> {
  const { data, error } = await supabase.from("gigs").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  return data ?? null;
}

export async function fetchCreatorGigs(creatorId: string): Promise<Gig[]> {
  const { data, error } = await supabase
    .from("gigs")
    .select("*")
    .eq("creator_id", creatorId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function fetchClientBookings(clientId: string): Promise<Booking[]> {
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function fetchCreatorBookings(creatorId: string): Promise<Booking[]> {
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("creator_id", creatorId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function fetchBooking(id: string): Promise<Booking | null> {
  const { data, error } = await supabase.from("bookings").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  return data ?? null;
}

export async function updateBookingStatus(id: string, status: BookingStatus): Promise<Booking> {
  const { data, error } = await supabase
    .from("bookings")
    .update({ status })
    .eq("id", id)
    .eq("status", "pending")
    .select()
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("This booking was already updated.");
  return data;
}

export async function setGigActive(id: string, isActive: boolean): Promise<void> {
  const { error } = await supabase.from("gigs").update({ is_active: isActive }).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteGig(id: string): Promise<void> {
  const { error } = await supabase.from("gigs").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
