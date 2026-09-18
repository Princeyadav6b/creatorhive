import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { GIG_CATEGORIES } from "@/lib/constants";
import { gigSchema, type GigFormOutput, type GigFormValues } from "@/lib/validation";

function FieldError({ message }: { message?: string | undefined }) {
  if (!message) return null;
  return (
    <p role="alert" className="text-sm font-medium text-destructive">
      {message}
    </p>
  );
}

export function GigForm({
  defaultValues,
  submitLabel,
  pending,
  onSubmit,
}: {
  defaultValues?: Partial<GigFormValues>;
  submitLabel: string;
  pending: boolean;
  onSubmit: (values: GigFormOutput) => void | Promise<void>;
}) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<GigFormValues, unknown, GigFormOutput>({
    resolver: zodResolver(gigSchema),
    defaultValues: {
      title: "",
      rate: "" as unknown as number,
      rateType: "fixed",
      description: "",
      deliveryDays: "" as unknown as number,
      coverImageUrl: "",
      ...defaultValues,
    } as GigFormValues,
  });

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="space-y-2">
        <Label htmlFor="title">Gig title</Label>
        <Input
          id="title"
          placeholder="e.g. Bold brand identity kits for new startups"
          {...register("title")}
        />
        <FieldError message={errors.title?.message} />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Controller
            control={control}
            name="category"
            render={({ field }) => (
              <Select value={field.value ?? ""} onValueChange={field.onChange}>
                <SelectTrigger id="category" aria-label="Category">
                  <SelectValue placeholder="Choose a category" />
                </SelectTrigger>
                <SelectContent>
                  {GIG_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FieldError message={errors.category?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="deliveryDays">Delivery time (days)</Label>
          <Input
            id="deliveryDays"
            type="number"
            min={1}
            placeholder="7"
            {...register("deliveryDays")}
          />
          <FieldError message={errors.deliveryDays?.message} />
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="rate">Rate (USD)</Label>
          <Input id="rate" type="number" min={1} step="1" placeholder="350" {...register("rate")} />
          <FieldError message={errors.rate?.message} />
        </div>

        <div className="space-y-2">
          <span className="text-sm font-medium">Rate type</span>
          <Controller
            control={control}
            name="rateType"
            render={({ field }) => (
              <RadioGroup
                className="flex gap-4 pt-1"
                value={field.value}
                onValueChange={field.onChange}
                aria-label="Rate type"
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="fixed" id="rate-fixed" />
                  <Label htmlFor="rate-fixed" className="font-normal">
                    Fixed price
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="hourly" id="rate-hourly" />
                  <Label htmlFor="rate-hourly" className="font-normal">
                    Hourly
                  </Label>
                </div>
              </RadioGroup>
            )}
          />
          <FieldError message={errors.rateType?.message} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          rows={7}
          placeholder="Describe what's included, how you work, and what the client receives."
          {...register("description")}
        />
        <FieldError message={errors.description?.message} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="coverImageUrl">Cover image URL (optional)</Label>
        <Input id="coverImageUrl" placeholder="https://…" {...register("coverImageUrl")} />
        <FieldError message={errors.coverImageUrl?.message} />
      </div>

      <Button type="submit" size="lg" disabled={pending} className="w-full sm:w-auto">
        {pending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
        {pending ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}
