import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { GigForm } from "@/components/GigForm";
import { RequireRole } from "@/components/RequireRole";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { gigKeys } from "@/lib/api";
import type { GigFormOutput } from "@/lib/validation";

export const Route = createFileRoute("/gigs/new")({
  head: () => ({
    meta: [
      { title: "Post a gig — CreatorHive" },
      {
        name: "description",
        content: "Publish a new creative service and start receiving booking requests.",
      },
      { property: "og:title", content: "Post a gig — CreatorHive" },
      { property: "og:description", content: "Publish a new creative service on CreatorHive." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <RequireRole role="creator">
      <NewGigPage />
    </RequireRole>
  ),
});

function NewGigPage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [pending, setPending] = useState(false);

  async function handleSubmit(values: GigFormOutput) {
    if (!user || pending) return;
    setPending(true);
    try {
      const { data, error } = await supabase
        .from("gigs")
        .insert({
          creator_id: user.id,
          creator_name: profile?.full_name ?? "Creator",
          title: values.title,
          category: values.category,
          rate: values.rate,
          rate_type: values.rateType,
          description: values.description,
          delivery_days: values.deliveryDays,
          cover_image_url: values.coverImageUrl || null,
        })
        .select()
        .single();
      if (error) throw new Error(error.message);
      await queryClient.invalidateQueries({ queryKey: gigKeys.all });
      toast.success("Gig published");
      void navigate({ to: "/gigs/$id", params: { id: data.id } });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not publish your gig");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold">Post a gig</h1>
      <p className="mt-2 text-muted-foreground">
        Tell clients what you offer, how fast you deliver and what it costs.
      </p>
      <div className="surface-card mt-8 p-6 sm:p-8">
        <GigForm submitLabel="Publish gig" pending={pending} onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
