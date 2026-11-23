/**
 * markdown.ts — a small, safe subset markdown renderer for journal bodies
 * (FID-AUD-404, TASK-2026-037).
 *
 * SECURITY MODEL: the input is treated as UNTRUSTED TEXT. Raw HTML is ALWAYS
 * escaped on entry (never passed through). Only the specific markdown constructs
 * we render ourselves are converted into a fixed set of safe tags. There is no
 * path for attacker-provided HTML to reach the DOM.
 *
 * Rendered subset:
 *   - headings  # / ## / ### → h1/h2/h3
 *   - paragraphs and <br>
 *   - **bold**  and *italic*
 *   - unordered and ordered lists (-, 1.)
 *   - links  [text](href)   → only http(s) or same-site relative hrefs; javascript:/data:
 *     and unknown schemes are dropped (rendered as plain text)
 *   - sources list heuristic: a heading or line starting with "Sources"/"المصادر"
 *     followed by " * [label](href)" lines are rendered as a <ul class="journal-sources">
 *   - inline code `...`
 *
 * Everything else (images, raw HTML, script blocks) is escaped and shown as text.
 */

export type RenderOptions = {
  /** Render class hooks so styling can target journal typography. */
  proseClassName?: string;
};

const HEADING_RE = /^(#{1,3})\s+(.*)$/;
const LIST_ITEM_RE = /^\s*[-*]\s+(.*)$/;
const ORDERED_ITEM_RE = /^\s*\d+[.)]\s+(.*)$/;
const SOURCES_HEADING_RE = /^(Sources|المصادر)s?[:]?$/i;

/** Escape every HTML-significant character in a text span. Applied FIRST. */
function escapeText(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * URL policy: only http:, https: and same-site (leading /) URLs are allowed.
 * Any other scheme (javascript:, data:, vbscript:, file:, ftp:) is rejected so
 * the src is rendered as escaped plain text instead of a clickable link.
 */
function safeUrl(href: string): string | null {
  const trimmed = href.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("/")) return trimmed;
  try {
    const u = new URL(trimmed);
    if (u.protocol === "http:" || u.protocol === "https:") return trimmed;
    return null;
  } catch {
    return null;
  }
}

/** Inline pass: bold / italic / code / links, after the whole string was escaped first. */
function renderInline(input: string): string {
  let out = input;

  // [label](href) — validate scheme, else emit label as plain text.
  out = out.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, label: string, rawHref: string) => {
    const href = safeUrl(rawHref);
    if (!href) return escapeText(label);
    const decodedHref = href.replace(/&amp;/g, "&");
    return `<a href="${escAttr(decodedHref)}" target="_blank" rel="noopener noreferrer">${label}</a>`;
  });

  // Inline code `...`
  out = out.replace(/`([^`]+)`/g, "<code>$1</code>");

  // Bold **text**
  out = out.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");

  // Italic *text*  (not caught by bold)
  out = out.replace(/\*([^*]+)\*/g, "<em>$1</em>");

  // Hard line breaks within a paragraph
  out = out.replace(/  \n/g, "<br/>\n");

  return out;
}

function escAttr(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function renderSources(headingText: string, items: string[]): string {
  const safeHeading = escapeText(headingText.trim().replace(/:\s*$/, ""));
  const list = items
    .map((item) => `<li>${renderInline(item.trim())}</li>`)
    .join("");
  return `<div class="journal-sources"><h2>${safeHeading}</h2><ul>${list}</ul></div>`;
}

/**
 * Render a journal body (translated EN or AR markdown) into safe HTML.
 * Safe on the server; the returned string is server-rendered markup that Next
 * may hydrate — nowhere do we use dangerouslySetInnerHTML with unfiltered input,
 * and this function is the single choke point that guarantees escaping first.
 */
export function renderJournalBody(markdown: string, options?: RenderOptions): string {
  void options; // reserved for future prose class hooks
  const source = escapeText(markdown);

  // Split into logical blocks on blank lines (preserving list grouping).
  const rawBlocks = source.split(/\n\s*\n/);
  const blocks: string[] = [];

  let i = 0;
  while (i < rawBlocks.length) {
    const block = rawBlocks[i];
    const lines = block.split("\n");
    const first = lines[0] ?? "";
    const trimmed = first.trim();

    // Sources section: a standalone "Sources"/"المصادر" heading followed by a
    // bullet "* [label](href)" list (may be split by a blank line into separate
    // logical blocks). Render as a single labelled, safe list block.
    if (SOURCES_HEADING_RE.test(trimmed)) {
      const items: string[] = [];
      const consume = (ls: string[]) => {
        for (const l of ls) {
          const m = l.match(LIST_ITEM_RE);
          if (m) items.push(m[1]);
        }
      };
      consume(lines);
      // Peek ahead: absorb any following blocks that are purely bullet items.
      while (i + 1 < rawBlocks.length && rawBlocks[i + 1].split("\n").every((l) => LIST_ITEM_RE.test(l) || l.trim() === "")) {
        i += 1;
        consume(rawBlocks[i].split("\n"));
      }
      blocks.push(renderSources(trimmed, items));
      i += 1;
      continue;
    }

    // Headings
    const heading = first.match(HEADING_RE);
    if (heading && lines.length === 1) {
      const level = heading[1].length;
      const tag = level <= 1 ? "h1" : level === 2 ? "h2" : "h3";
      blocks.push(`<${tag}>${renderInline(heading[2])}</${tag}>`);
      i += 1;
      continue;
    }

    // Ordered list
    if (ORDERED_ITEM_RE.test(first)) {
      const items = lines
        .filter((l) => ORDERED_ITEM_RE.test(l) || l.trim() === "")
        .map((l) => l.trim())
        .filter(Boolean)
        .map((l) => l.replace(ORDERED_ITEM_RE, "$1"))
        .map((item) => `<li>${renderInline(item)}</li>`);
      blocks.push(`<ol>${items.join("")}</ol>`);
      i += 1;
      continue;
    }

    // Unordered list
    if (LIST_ITEM_RE.test(first)) {
      const items = lines
        .filter((l) => LIST_ITEM_RE.test(l) || l.trim() === "")
        .map((l) => l.trim())
        .filter(Boolean)
        .map((l) => l.replace(LIST_ITEM_RE, "$1"))
        .map((item) => `<li>${renderInline(item)}</li>`);
      blocks.push(`<ul>${items.join("")}</ul>`);
      i += 1;
      continue;
    }

    // Ordinary paragraph (join single newlines into spaces)
    blocks.push(`<p>${renderInline(block)}</p>`);
    i += 1;
  }

  return blocks.join("\n");
}