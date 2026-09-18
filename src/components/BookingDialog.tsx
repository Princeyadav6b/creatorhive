import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/StatusBadge";
import { supabase } from "@/integrations/supabase/client";
import { bookingKeys } from "@/lib/api";
import { formatDate, formatMoney } from "@/lib/format";
import type { Booking, Gig } from "@/lib/types";
import { bookingSchema, type BookingFormOutput, type BookingFormValues } from "@/lib/validation";

function FieldError({ message }: { message?: string | undefined }) {
  if (!message) return null;
  return (
    <p role="alert" className="text-sm font-medium text-destructive">
      {message}
    </p>
  );
}

export function BookingDialog({
  gig,
  clientId,
  clientName,
  clientEmail,
  open,
  onOpenChange,
}: {
  gig: Gig;
  clientId: string;
  clientName: string;
  clientEmail: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState<Booking | null>(null);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BookingFormValues, unknown, BookingFormOutput>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      projectTitle: "",
      requirements: "",
      preferredStartDate: "",
      expectedDeliveryDate: "",
      budget: "" as unknown as number,
      contactEmail: clientEmail,
      referenceLink: "",
    },
  });

  async function submit(values: BookingFormOutput) {
    if (submitting) return;
    setSubmitting(true);
    try {
      const { data, error } = await supabase
        .from("bookings")
        .insert({
          gig_id: gig.id,
          gig_title: gig.title,
          creator_id: gig.creator_id,
          creator_name: gig.creator_name,
          client_id: clientId,
          client_name: clientName,
          project_title: values.projectTitle,
          requirements: values.requirements,
          preferred_start_date: values.preferredStartDate,
          expected_delivery_date: values.expectedDeliveryDate,
          budget: values.budget,
          contact_email: values.contactEmail,
          reference_link: values.referenceLink || null,
        })
        .select()
        .single();
      if (error) throw new Error(error.message);
      setConfirmed(data);
      reset();
      void queryClient.invalidateQueries({ queryKey: bookingKeys.client(clientId) });
      toast.success("Booking request sent");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not send your booking");
    } finally {
      setSubmitting(false);
    }
  }

  function handleOpenChange(next: boolean) {
    onOpenChange(next);
    if (!next) setTimeout(() => setConfirmed(null), 200);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        {confirmed ? (
          <div className="space-y-5">
            <DialogHeader>
              <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-success/15 text-success">
                <CheckCircle2 className="size-6" aria-hidden="true" />
              </span>
              <DialogTitle className="text-center">Booking request sent</DialogTitle>
              <DialogDescription className="text-center">
                {gig.creator_name} will review your brief and respond soon.
              </DialogDescription>
            </DialogHeader>

            <dl className="space-y-3 rounded-2xl bg-secondary/70 p-4 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Reference</dt>
                <dd className="font-semibold">{confirmed.reference_number}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Gig</dt>
                <dd className="text-right font-medium">{confirmed.gig_title}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Creator</dt>
                <dd className="font-medium">{confirmed.creator_name}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Submitted</dt>
                <dd className="font-medium">{formatDate(confirmed.created_at)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Budget</dt>
                <dd className="font-medium">{formatMoney(confirmed.budget)}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted-foreground">Status</dt>
                <dd>
                  <StatusBadge status={confirmed.status} />
                </dd>
              </div>
            </dl>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button asChild className="flex-1">
                <Link to="/my-bookings">Go to My Bookings</Link>
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => handleOpenChange(false)}>
                Keep browsing
              </Button>
            </div>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Book “{gig.title}”</DialogTitle>
              <DialogDescription>
                Share your brief so {gig.creator_name} can respond quickly.
              </DialogDescription>
            </DialogHeader>

            <form className="space-y-4" onSubmit={handleSubmit(submit)} noValidate>
              <div className="space-y-2">
                <Label htmlFor="projectTitle">Project title</Label>
                <Input id="projectTitle" {...register("projectTitle")} />
                <FieldError message={errors.projectTitle?.message} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="requirements">Project requirements</Label>
                <Textarea id="requirements" rows={4} {...register("requirements")} />
                <FieldError message={errors.requirements?.message} />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="preferredStartDate">Preferred start date</Label>
                  <Input id="preferredStartDate" type="date" {...register("preferredStartDate")} />
                  <FieldError message={errors.preferredStartDate?.message} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expectedDeliveryDate">Expected delivery date</Label>
                  <Input
                    id="expectedDeliveryDate"
                    type="date"
                    {...register("expectedDeliveryDate")}
                  />
                  <FieldError message={errors.expectedDeliveryDate?.message} />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="budget">Budget (USD)</Label>
                  <Input id="budget" type="number" min={1} {...register("budget")} />
                  <FieldError message={errors.budget?.message} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Contact email</Label>
                  <Input id="contactEmail" type="email" {...register("contactEmail")} />
                  <FieldError message={errors.contactEmail?.message} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="referenceLink">Reference link (optional)</Label>
                <Input id="referenceLink" placeholder="https://…" {...register("referenceLink")} />
                <FieldError message={errors.referenceLink?.message} />
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={submitting}>
                {submitting && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
                {submitting ? "Sending request…" : "Send booking request"}
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
