export const GIG_CATEGORIES = [
  "Graphic Design",
  "Video Editing",
  "Photography",
  "Content Writing",
  "Social Media",
  "Music and Audio",
  "Web Development",
  "Animation",
  "Other",
] as const;

export type GigCategory = (typeof GIG_CATEGORIES)[number];

export const CATEGORY_GRADIENTS: Record<string, string> = {
  "Graphic Design": "from-primary/25 to-accent/20",
  "Video Editing": "from-accent/25 to-primary/20",
  Photography: "from-highlight/30 to-primary/15",
  "Content Writing": "from-success/25 to-accent/15",
  "Social Media": "from-primary/20 to-highlight/25",
  "Music and Audio": "from-accent/25 to-highlight/20",
  "Web Development": "from-primary/25 to-success/15",
  Animation: "from-highlight/25 to-accent/25",
  Other: "from-muted to-secondary",
};

export const RATE_TYPES = ["fixed", "hourly"] as const;
export const BOOKING_STATUSES = ["pending", "accepted", "declined"] as const;

export const DEMO_ACCOUNTS = [
  { label: "Demo creator", email: "maya@creatorhive.demo", password: "CreatorHive123!" },
  { label: "Demo client", email: "nina@creatorhive.demo", password: "CreatorHive123!" },
] as const;
