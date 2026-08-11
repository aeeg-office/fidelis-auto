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
