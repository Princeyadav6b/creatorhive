import type { RateType } from "./types";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function formatMoney(value: number | string): string {
  const numeric = typeof value === "string" ? Number(value) : value;
  if (Number.isNaN(numeric)) return "$0";
  return currency.format(numeric);
}

export function formatRate(value: number | string, rateType: RateType): string {
  return `${formatMoney(value)}${rateType === "hourly" ? " / hr" : ""}`;
}

export function rateTypeLabel(rateType: RateType): string {
  return rateType === "hourly" ? "Hourly" : "Fixed price";
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value.length <= 10 ? `${value}T00:00:00` : value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function initials(name: string): string {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "CH"
  );
}

export function truncate(text: string, max = 140): string {
  return text.length > max ? `${text.slice(0, max).trimEnd()}…` : text;
}
