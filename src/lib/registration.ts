export type RegistrationInput = {
  firstName?: unknown;
  lastName?: unknown;
  email?: unknown;
  mobileNumber?: unknown;
  country?: unknown;
  city?: unknown;
  password?: unknown;
};

export type NormalizedRegistration = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  password: string;
};

const asTrimmedString = (value: unknown): string =>
  typeof value === "string" ? value.trim() : "";

export function normalizeRegistration(input: RegistrationInput): NormalizedRegistration {
  return {
    firstName: asTrimmedString(input.firstName),
    lastName: asTrimmedString(input.lastName),
    email: asTrimmedString(input.email).toLowerCase(),
    phone: asTrimmedString(input.mobileNumber),
    country: asTrimmedString(input.country),
    city: asTrimmedString(input.city),
    password: typeof input.password === "string" ? input.password : "",
  };
}

export function validatePassword(password: string): string | null {
  if (password.length < 8) return "Password must be at least 8 characters.";
  if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter.";
  if (!/[0-9]/.test(password)) return "Password must contain at least one number.";
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password)) {
    return "Password must contain at least one symbol.";
  }
  return null;
}

export function validateRegistration(input: RegistrationInput): { ok: true } | { ok: false; error: string } {
  const registration = normalizeRegistration(input);
  if (!registration.firstName) return { ok: false, error: "First name is required." };
  if (!registration.lastName) return { ok: false, error: "Last name is required." };
  if (!registration.email || !/^\S+@\S+\.\S+$/.test(registration.email)) {
    return { ok: false, error: "A valid email address is required." };
  }
  if (!registration.phone) return { ok: false, error: "Mobile number is required." };
  if (!registration.country) return { ok: false, error: "Country is required." };
  if (!registration.city) return { ok: false, error: "City is required." };
  const passwordError = validatePassword(registration.password);
  if (passwordError) return { ok: false, error: passwordError };
  return { ok: true };
}

type DealerRegistrationInput = {
  businessName?: unknown;
  contactPerson?: unknown;
  email?: unknown;
  phone?: unknown;
  address?: unknown;
  city?: unknown;
  country?: unknown;
  description?: unknown;
  website?: unknown;
  logoUrl?: unknown;
};

type NormalizedDealerRegistration = {
  businessName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  description: string;
  website: string | null;
  logoUrl: string | null;
};

export function validateDealerRegistration(input: DealerRegistrationInput):
  | { ok: true; value: NormalizedDealerRegistration }
  | { ok: false; error: string } {
  const value: NormalizedDealerRegistration = {
    businessName: asTrimmedString(input.businessName),
    contactPerson: asTrimmedString(input.contactPerson),
    email: asTrimmedString(input.email).toLowerCase(),
    phone: asTrimmedString(input.phone),
    address: asTrimmedString(input.address),
    city: asTrimmedString(input.city),
    country: asTrimmedString(input.country),
    description: asTrimmedString(input.description),
    website: asTrimmedString(input.website) || null,
    logoUrl: asTrimmedString(input.logoUrl) || null,
  };

  if (!value.businessName) return { ok: false, error: "Business name is required." };
  if (!value.contactPerson) return { ok: false, error: "Contact person is required." };
  if (!value.email || !/^\S+@\S+\.\S+$/.test(value.email)) return { ok: false, error: "A valid business email is required." };
  if (!value.phone) return { ok: false, error: "Business phone is required." };
  if (!value.address) return { ok: false, error: "Business address is required." };
  if (!value.city) return { ok: false, error: "City is required." };
  if (!value.country) return { ok: false, error: "Country is required." };
  if (value.description.length < 30) return { ok: false, error: "Business description must be at least 30 characters." };
  return { ok: true, value };
}
