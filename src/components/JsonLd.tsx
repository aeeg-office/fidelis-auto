import type { JSX } from "react";

type JsonLdProps = {
  type: string;
  data: Record<string, unknown>;
};

/**
 * Renders a JSON-LD structured-data script tag.
 *
 * Usage:
 *   <JsonLd type="Organization" data={{ name: "...", url: "..." }} />
 */
export default function JsonLd({ type, data }: JsonLdProps): JSX.Element {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": type,
    ...data,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}