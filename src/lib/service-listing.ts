type ServicePayload = Record<string, unknown>;
export type ServiceListingInput = {
  businessName: string;
  category: string;
  description: string;
  phone: string | null;
  website: string | null;
  city: string | null;
  country: string | null;
};

const SERVICE_CATEGORIES = new Set(["Restoration", "Maintenance", "Inspection", "Transport", "Storage", "Detailing", "Insurance", "Other"]);
const text = (value: unknown, max: number) => typeof value === "string" ? value.trim().slice(0, max) : "";

export function normalizeServiceListing(payload: ServicePayload): { ok: true; value: ServiceListingInput } | { ok: false; error: string } {
  const businessName = text(payload.businessName, 120);
  const category = text(payload.category, 60);
  const description = text(payload.description, 2_000);
  if (!businessName || !SERVICE_CATEGORIES.has(category) || !description) {
    return { ok: false, error: "Business name, a valid category, and description are required." };
  }
  const rawWebsite = text(payload.website, 500);
  if (rawWebsite && !/^https:\/\/[^\s]+$/i.test(rawWebsite)) return { ok: false, error: "Website must use HTTPS." };
  return {
    ok: true,
    value: {
      businessName,
      category,
      description,
      phone: text(payload.phone, 80) || null,
      website: rawWebsite || null,
      city: text(payload.city, 100) || null,
      country: text(payload.country, 100) || null,
    },
  };
}

export const serviceCategories = [...SERVICE_CATEGORIES];
