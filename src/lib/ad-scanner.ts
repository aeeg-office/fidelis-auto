/**
 * ad-scanner.ts
 * Scans listing submission text for "ad text violations" that should force
 * manual moderation instead of automated approval.
 *
 * Rules (case-insensitive) — if ANY matches, the submission is NOT auto-approved:
 *  - Contact harvesting: email addresses, phone numbers, wa.me/whatsapp/telegram
 *    handles, "@" mentions, "dot com" phrasing (routing buyers off-platform)
 *  - Spam / ad filler: profanity, "call now", "contact me", "best price",
 *    "limited time", "act fast", "visit our", "check out", excessive all-caps
 *  - External links: any http(s):// or www. URL in the body
 *  - Malformed essential: empty model (validated upstream) or an unreasonable
 *    price/phone-like numeric field — handled by normalization; not repeated here.
 */

const EMAIL_RE = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;

// Phone: international prefix optional + 7+ digits, or common grouped formats.
const PHONE_RE =
  /(?:\+?\d{1,3}[\s.-]?)?(?:\(\d{1,4}\)[\s.-]?)?\d[\s.-]?\d{3}[\s.-]?\d{4}(?:\s*(?:ext|x)\s*\d{1,5})?/i;

const CONTACT_HANDLES =
  /\b(?:wa\.me|whatsapp|telegram|t\.me|call(?: me)?|contact me|message me|dm me|reach me)\b/i;

const DOT_COM_PHRASE =
  /(?:dot\s*com|at\s+[a-z0-9.-]+\s+dot\s+com|\[at\]|\(at\))/i;

const URL_RE = /\b(?:https?:\/\/|www\.)\S+/i;

const SPAM_PHRASES =
  /\b(?:call now|contact now|best price|great deal|limited time|act fast|don't miss(?: out)?|hurry|free gift|click here|visit our|check out|urgent sale|must sell|price drop|o?nly today)\b/i;

// A small, conservative profanity list (common English). Extend as needed.
const PROFANITY_RE =
  /\b(?:fuck|shit|bitch|asshole|bastard|damn|hell|crap|piss|slut|cunt|nigg[ae]r|fag(?:got)?|dick|pussy)\b/i;

// Excessive all-caps (>=6 consecutive uppercase words) reads like spam.
const EXCESSIVE_CAPS_RE =
  /\b[A-Z]{2,}(?:\s+[A-Z]{2,}){5,}\b/;

type ScanField = string | null;

/** Gather all non-empty text fields into a single lowercase buffer. */
function textBuffer(fields: Record<string, ScanField>): string {
  return Object.values(fields)
    .filter((v): v is string => Boolean(v))
    .join(" \n ");
}

export interface AdScanResult {
  /** True when the ad text is clean and eligible for automated approval. */
  clean: boolean;
  /** Human-readable reasons; empty when clean. */
  violations: string[];
}

/**
 * Scan a submission for ad-text violations.
 * @param fields map of the submission's textf fields (make, model, trim,
 *        description, phone, city, etc.)
 */
export function scanAdText(fields: Record<string, ScanField>): AdScanResult {
  const text = textBuffer(fields);
  if (!text.trim()) return { clean: true, violations: [] };

  const violations: string[] = [];

  if (EMAIL_RE.test(text)) violations.push("email address in ad text");
  if (PHONE_RE.test(text)) violations.push("phone number in ad text");
  if (CONTACT_HANDLES.test(text))
    violations.push("contact-harvesting wording (call/contact/whatsapp/telegram)");
  if (DOT_COM_PHRASE.test(text)) violations.push("‘dot com’ / off-platform contact phrasing");
  if (URL_RE.test(text)) violations.push("external link in ad text");
  if (SPAM_PHRASES.test(text)) violations.push("spam/sales-filler phrasing");
  if (PROFANITY_RE.test(text)) violations.push("profanity");
  if (EXCESSIVE_CAPS_RE.test(text)) violations.push("excessive all-caps spam");

  return { clean: violations.length === 0, violations };
}
