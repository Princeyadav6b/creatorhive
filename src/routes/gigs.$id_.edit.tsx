import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { GigForm } from "@/components/GigForm";
import { RequireRole } from "@/components/RequireRole";
import { EmptyState } from "@/components/States";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { fetchGig, gigKeys } from "@/lib/api";
import type { GigFormOutput, GigFormValues } from "@/lib/validation";

export const Route = createFileRoute("/gigs/$id_/edit")({
  head: () => ({
    meta: [
      { title: "Edit gig — CreatorHive" },
      {
        name: "description",
        content: "Update the details, pricing and delivery time of your gig.",
      },
      { property: "og:title", content: "Edit gig — CreatorHive" },
      { property: "og:description", content: "Update your CreatorHive gig." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <RequireRole role="creator">
      <EditGigPage />
    </RequireRole>
  ),
});

function EditGigPage() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [pending, setPending] = useState(false);

  const { data: gig, isLoading } = useQuery({
    queryKey: gigKeys.byId(id),
    queryFn: () => fetchGig(id),
  });

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-3xl space-y-4 px-4 py-12 sm:px-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  if (!gig || gig.creator_id !== user?.id) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6">
        <EmptyState
          title="Gig not found"
          description="This gig doesn't exist, or it belongs to another creator."
          action={
            <Button asChild variant="outline">
              <Link to="/creator/dashboard">Back to dashboard</Link>
            </Button>
          }
        />
      </div>
    );
  }

  async function handleSubmit(values: GigFormOutput) {
    if (pending) return;
    setPending(true);
    try {
      const { error } = await supabase
        .from("gigs")
        .update({
          title: values.title,
          category: values.category,
          rate: values.rate,
          rate_type: values.rateType,
          description: values.description,
          delivery_days: values.deliveryDays,
          cover_image_url: values.coverImageUrl || null,
        })
        .eq("id", id);
      if (error) throw new Error(error.message);
      await queryClient.invalidateQueries({ queryKey: gigKeys.all });
      toast.success("Gig updated");
      void navigate({ to: "/creator/dashboard" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update your gig");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold">Edit gig</h1>
      <p className="mt-2 text-muted-foreground">Changes go live immediately in the marketplace.</p>
      <div className="surface-card mt-8 p-6 sm:p-8">
        <GigForm
          submitLabel="Save changes"
          pending={pending}
          onSubmit={handleSubmit}
          defaultValues={{
            title: gig.title,
            category: gig.category as GigFormValues["category"],
            rate: Number(gig.rate),
            rateType: gig.rate_type,
            description: gig.description,
            deliveryDays: gig.delivery_days,
            coverImageUrl: gig.cover_image_url ?? "",
          }}
        />
      </div>
    </div>
  );
}
