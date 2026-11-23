import { describe, it, expect } from "vitest";
import { renderJournalBody } from "./markdown";

describe("renderJournalBody — XSS safety", () => {
  it("escapes raw <script> tags", () => {
    const html = renderJournalBody("<script>alert(1)</script>");
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });

  it("escapes <img onerror> payloads", () => {
    const html = renderJournalBody('hello <img src=x onerror="alert(1)">');
    expect(html).not.toMatch(/<img\b/i); // no real <img> tag
    // the whole payload is escaped as inert entities
    expect(html).toContain("&lt;img");
    expect(html).toContain("&quot;alert(1)&quot;&gt;");
  });

  it("escapes inline event handlers and iframes", () => {
    const html = renderJournalBody("<iframe src=evil></iframe> <div onclick=alert(1)>x</div>");
    expect(html).toContain("&lt;iframe");
    expect(html).toContain("&lt;div");
    expect(html).not.toMatch(/<iframe\b|<div\b/i); // no real tags
    // the event handler is inert escaped text, not an attribute assignment
    expect(html).toContain("&lt;div onclick=alert(1)&gt;");
  });

  it("refuses javascript: links (drops the href, keeps the label as plain text)", () => {
    const html = renderJournalBody("[click me](javascript:alert(1))");
    expect(html).not.toContain('href="javascript:');
    // label is not wrapped in an <a> — it renders as plain text
    expect(html).not.toContain("href=");
  });

  it("refuses data: and vbscript: links", () => {
    const js = renderJournalBody("x [a](data:text/html;base64,PHNjcmlwdD4=)");
    const vb = renderJournalBody("y [b](vbscript:msgbox(1))");
    expect(js).not.toContain("<a ");
    expect(vb).not.toContain("<a ");
  });

  it("escapes backtick-code injection and does not emit markdown as markup", () => {
    const html = renderJournalBody("unsafe `</code><img src=x>` tail");
    expect(html).not.toContain("<img");
  });

  it("does not double-escape a legitimate linked label", () => {
    const html = renderJournalBody("[See the guide](https://example.com/a)");
    expect(html).toContain('<a href="https://example.com/a"');
    expect(html).toContain("See the guide");
  });
});

describe("renderJournalBody — markdown subset", () => {
  it("renders headings, bold, italic", () => {
    const html = renderJournalBody("# Title\n\nSome **bold** and *italic* text.");
    expect(html).toContain("<h1>Title</h1>");
    expect(html).toContain("<strong>bold</strong>");
    expect(html).toContain("<em>italic</em>");
  });

  it("renders ordered and unordered lists", () => {
    const html = renderJournalBody("Steps:\n\n1. first\n2. second\n\n- a\n- b");
    expect(html).toContain("<ol><li>first</li><li>second</li></ol>");
    expect(html).toContain("<ul><li>a</li><li>b</li></ul>");
  });

  it("renders a Sources list as a labelled block with clickable links", () => {
    const html = renderJournalBody("Sources\n\n * [Genesis](https://example.com/gen)\n * [Registry](https://example.com/reg)");
    expect(html).toContain("journal-sources");
    expect(html).toContain('<a href="https://example.com/gen"');
    expect(html).toContain('rel="noopener noreferrer"');
  });

  it("allows same-site internal links", () => {
    const html = renderJournalBody("[a used 911](/vehicles/porsche-911)");
    expect(html).toContain('href="/vehicles/porsche-911"');
  });

  it("survives the exact current body format (plainline markdown with two-line breaks)", () => {
    const body = "1. A quality socket set.\n2. A torque wrench.\n3. A good jack and axle stands.";
    const html = renderJournalBody(body);
    expect(html).toContain("<ol>");
    expect(html).toContain("<li>A quality socket set.</li>");
    expect(html).toContain("<li>A torque wrench.</li>");
  });
});