import { z } from "zod";
import { GIG_CATEGORIES } from "./constants";

const today = () => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now;
};

export const gigSchema = z.object({
  title: z
    .string()
    .trim()
    .min(5, "Title must be at least 5 characters")
    .max(80, "Title must be 80 characters or fewer"),
  category: z.enum(GIG_CATEGORIES, { required_error: "Please choose a category" }),
  rate: z.coerce
    .number({ invalid_type_error: "Enter a rate" })
    .positive("Rate must be greater than zero"),
  rateType: z.enum(["fixed", "hourly"], { required_error: "Choose a rate type" }),
  description: z
    .string()
    .trim()
    .min(30, "Description must be at least 30 characters")
    .max(1000, "Description must be 1000 characters or fewer"),
  deliveryDays: z.coerce
    .number({ invalid_type_error: "Enter a delivery time" })
    .int("Use whole days")
    .positive("Delivery time must be greater than zero"),
  coverImageUrl: z
    .union([z.string().trim().url("Enter a valid image URL"), z.literal("")])
    .optional(),
});

export type GigFormValues = z.input<typeof gigSchema>;
export type GigFormOutput = z.output<typeof gigSchema>;

export const bookingSchema = z
  .object({
    projectTitle: z.string().trim().min(3, "Project title is required"),
    requirements: z
      .string()
      .trim()
      .min(20, "Please describe your project in at least 20 characters"),
    preferredStartDate: z.string().min(1, "Choose a start date"),
    expectedDeliveryDate: z.string().min(1, "Choose a delivery date"),
    budget: z.coerce
      .number({ invalid_type_error: "Enter a budget" })
      .positive("Budget must be greater than zero"),
    contactEmail: z.string().trim().email("Enter a valid email address"),
    referenceLink: z.union([z.string().trim().url("Enter a valid link"), z.literal("")]).optional(),
  })
  .refine((values) => new Date(`${values.preferredStartDate}T00:00:00`) >= today(), {
    message: "Start date cannot be in the past",
    path: ["preferredStartDate"],
  })
  .refine(
    (values) =>
      new Date(`${values.expectedDeliveryDate}T00:00:00`) >=
      new Date(`${values.preferredStartDate}T00:00:00`),
    { message: "Delivery date cannot be before the start date", path: ["expectedDeliveryDate"] },
  );

export type BookingFormValues = z.input<typeof bookingSchema>;
export type BookingFormOutput = z.output<typeof bookingSchema>;

export const signUpSchema = z
  .object({
    fullName: z.string().trim().min(2, "Enter your full name"),
    email: z.string().trim().email("Enter a valid email address"),
    password: z.string().min(8, "Use at least 8 characters"),
    confirmPassword: z.string().min(1, "Confirm your password"),
    role: z.enum(["creator", "client"], {
      required_error: "Choose how you want to use CreatorHive",
    }),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type SignUpValues = z.input<typeof signUpSchema>;

export const signInSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(1, "Enter your password"),
});

export type SignInValues = z.infer<typeof signInSchema>;
