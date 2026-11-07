type ServicePayload = Record<string, unknown>;
export type ServiceListingInput = {
  businessName: string;
  category: string;
  description: string;
  phone: string | null;
  website: string | null;
  city: string | null;
  country: string | null;
  specialties: string | null; // JSON array of specialist tags (make / era / skill)
  languages: string | null;
  coverageArea: string | null;
  whatsapp: string | null;
};

const SERVICE_CATEGORIES = new Set(["Restoration", "Maintenance", "Inspection", "Transport", "Storage", "Detailing", "Insurance", "Other"]);

// WS11 L+ — specialist tags by make, era and skill, plus spoken languages (spec v1.2)
export const SPECIALIST_TAGS = [
  // Makes
  "Mercedes-Benz", "BMW", "Porsche", "Land Rover", "Toyota", "Ford",
  // Eras
  "Classic", "Veteran", "Modern",
  // Skills
  "Restoration", "Bodywork", "Paint", "Electrical", "Mechanical", "Detailing", "Diagnostics",
] as const;

export const SERVICE_LANGUAGES = ["Arabic", "Arabic + English"] as const;

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
  const tags = Array.isArray(payload.specialties)
    ? (payload.specialties as unknown[])
        .map((t) => text(t, 40))
        .filter((t): t is string => t.length > 0 && (SPECIALIST_TAGS as readonly string[]).includes(t))
        .slice(0, 12)
    : [];
  const languages = payload.languages as string | null;
  const validLanguages = typeof languages === "string" && SERVICE_LANGUAGES.includes(languages as (typeof SERVICE_LANGUAGES)[number]);
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
      specialties: tags.length ? JSON.stringify(tags) : null,
      languages: validLanguages ? languages : null,
      coverageArea: text(payload.coverageArea, 200) || null,
      whatsapp: text(payload.whatsapp, 80) || null,
    },
  };
}

export const serviceCategories = [...SERVICE_CATEGORIES];
