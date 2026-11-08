// Fidelis Auto Journal — Editorial expansion (20 new bilingual articles).
// THIS FILE IS A BUILD OUTPUT. Each category module (articles-{cat}.ts) exports
// an array of JournalArticle. The seed aggregates all 20.
//
// Must-haves per article (mission §2):
//  - contentEn + contentAr (Arabic is an editorial adaptation, NOT literal translation)
//  - no fabricated interviews/experiences/stats/testimonials; hypotheticals labelled
//  - legal/regulatory/price/fee/technical claims fact-checked; date volatile figures "as of Nov 2026"
//  - every real claim sourced; end with a short Sources list; useful takeaway
//  - excerpt (EN) used for cards/metadata; titleAr + excerptAr optional but preferred
export interface JournalArticle {
  slug: string;
  titleEn: string;
  titleAr: string;
  excerptEn: string;
  excerptAr: string;
  category: string; // BLOG_CATEGORIES value
  editorialDate: string; // ISO archive date (one of the 4 weekly editorial dates)
  contentEn: string;
  contentAr: string;
  internalLinks: { label: string; href: string }[];
  sources: string[];
}