import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const url = process.env.DATABASE_URL || "postgresql://hermes_car:***@localhost:5432/hermes_car";
const adapter = new PrismaPg({ connectionString: url });
const prisma = new PrismaClient({ adapter });

// ─────────────────────────────────────────────────────────────
// Journal seed — Fidelis Auto
// 8 articles covering buying guides, road trips, care tips,
// and owner-facing content. Realistic publish dates spread
// across the last 3 months.
// ─────────────────────────────────────────────────────────────

type JournalInput = {
  slug: string;
  title: string;
  excerpt: string;
  contentEn: string;
  publishedAt: string;
};

const entries: JournalInput[] = [
  {
    slug: "how-to-inspect-a-used-porsche-911",
    title: "How to Inspect a Used Porsche 911",
    excerpt:
      "A practical, hands-on checklist for evaluating a used 911 before you buy — from the flat-six to the body panels.",
    publishedAt: "2026-05-12T09:00:00.000Z",
    contentEn: `Buying a used Porsche 911 is exciting, but the thrill of the hunt can blur your judgment. A disciplined inspection is your best protection against a costly surprise. Here is the checklist we use at Fidelis Auto whenever we evaluate a 911.

Start with the paperwork. A complete service history tells you more than almost any single component. Look for consistent oil changes, and confirm the timing chain or IMS-related work was done on the generations that need it. Matching VIN numbers on the body, engine, and transmission are a strong sign of originality.

Next, the body. Run a paint gauge over the panels and check the seams for signs of repair. 911s are unibody cars, so a bent or carbon-filled chassis is a serious red flag. Look for rust in the sills, the kidney bowls, and around the battery tray — these are the classic trouble spots.

Then the engine. A cold start is the best test. Listen for a steady idle, no metallic tapping, and no smoke on a warm up. The flat-six is durable, but it is sensitive to oil-neglect. Pull the dipstick and check the oil condition; burned, gritty oil is a warning sign.

Drive the car. The 911's steering is communicative and direct. Any clunking over bumps, wandering at speed, or odd vibrations could point to worn suspension bushings or a subframe issue. Brake the car hard from 60 mph and make sure it pulls straight.

Finally, lift the car and inspect the underside. Oil leaks, cracked CV boots, and corroded brake lines are all magnified by the cost of a 911's labor. In total, budget for a pre-purchase inspection by an independent specialist. It is a few hundred dollars that can save you tens of thousands.`,
  },
  {
    slug: "mercedes-benz-pagoda-what-to-know-before-buying",
    title: "Mercedes-Benz Pagoda: What to Know Before Buying",
    excerpt:
      "The W113 Pagoda is one of the most elegant roadsters ever built. Here is what buyers should know before taking the plunge.",
    publishedAt: "2026-05-28T09:00:00.000Z",
    contentEn: `The Mercedes-Benz 230SL, 250SL, and 280SL — known collectively as the W113 Pagoda for its concave hardtop — have earned a devoted following for good reason. They are beautiful, robust, and deeply satisfying to drive. But before you buy, a few things are worth knowing.

First, the three generations differ in more than displacement. The 230SL (1963–1967) is the most nimble and now the most collectible. The 250SL (1967–1968) was a short-lived transition car. The 280SL (1968–1971) has the most powerful engine and the most comfort features, making it the best daily driver of the three.

Rust is the Pagoda's greatest enemy. The floor pans, the spare wheel well, the rocker panels, and the area around the rear shock mounts all corrode. Pay close attention to the front fenders and the area where the hardtop seals. A rusty Pagoda is expensive to make right, so factor restoration cost into your offer.

The engine is generally reliable. The 2.3 and 2.8 litre straight-sixes are tough, but check the injection pump and the fuel system for leaks, and confirm the cooling system has been properly maintained. The automatic transmission is smooth but requires a specialist for service.

Interior trim is another factor. Original wood, gauges, and upholstery are increasingly hard to source, so a well-preserved cabin adds real value. Finally, drive the car. The Pagoda rewards a relaxed, confident driver. It is not a sharp sports car — it is a grand tourer that feels wonderful over a long journey.

If you buy one, maintain it through a Mercedes specialist who knows the W113. A well-sorted Pagoda is a joy for life.`,
  },
  {
    slug: "complete-guide-to-vehicle-provenance-checks",
    title: "The Complete Guide to Vehicle Provenance Checks",
    excerpt:
      "Provenance is the difference between a great car and a great story. Here is how to verify a vehicle's history properly.",
    publishedAt: "2026-06-09T09:00:00.000Z",
    contentEn: `Provenance is the documented history of a vehicle — who owned it, where it lived, how it was maintained, and whether it has ever been damaged or restored. For collectors, provenance can be worth more than the car itself. Here is how to check it properly.

Begin with the VIN. The vehicle identification number is the backbone of any history. Verify it against the registration documents, the title, and the stamped locations on the chassis and engine. A mismatch is a serious concern that should be resolved before any money changes hands.

Next, look for ownership records. Original purchase documents, service booklets, and titled history traces a chain of ownership. Gaps are not always a problem, but long unexplained gaps merit a question. Ask the seller directly about where the car was kept and how it was used.

Check the service records in detail. A complete, dated history with invoices and stamps is the strongest evidence of a well-maintained car. Look for consistent, timely maintenance and any warranty or recall work that was performed.

For imported or restored cars, demand documentation. Import certificates, customs forms, and restoration photographs with dated invoices build a credible file. If the seller cannot produce them, treat the claim with caution.

Finally, run a background check. In many markets, you can pull a history report that flags odometer rollbacks, total-loss write-offs, and outstanding finance. Combine all of this with an independent inspection, and you will have a provenance file you can trust.

At Fidelis Auto, we treat provenance as part of the car itself. We document every vehicle we present so you can buy with confidence.`,
  },
  {
    slug: "5-essential-tools-every-car-enthusiast-should-own",
    title: "5 Essential Tools Every Car Enthusiast Should Own",
    excerpt:
      "You do not need a full workshop to enjoy your car. These five tools cover the vast majority of enthusiast jobs.",
    publishedAt: "2026-06-21T09:00:00.000Z",
    contentEn: `You do not need an industrial workshop to work on your own car. A handful of well-chosen tools will get you through the vast majority of enthusiast jobs — and save you a fortune in labour in the process. Here are the five we would not be without.

1. A quality socket set. Buy a 3/8-inch drive set with both metric and SAE sockets, a ratchet, and a breaker bar. Add a set of extensions and a universal joint. This single kit handles most fasteners on most cars and is the foundation of everything else.

2. A torque wrench. Over-tightening is as damaging as under-tightening. A torque wrench lets you set wheel bolts, suspension hardware, and engine fasteners to the manufacturer's specification. It is essential for any job where you are removing and refitting critical parts.

3. A good jack and axle stands. Never just crawl under a car supported by a jack alone. A proper floor jack paired with a pair of rated axle stands makes wheel, brake, and suspension work safe and comfortable. Buy stands with a generous weight rating.

4. A multimeter. Electrical faults are the most common source of frustration in modern cars. A basic digital multimeter lets you test battery voltage, check fuses, trace wiring, and diagnose sensors. You will wonder how you managed without it.

5. A code reader. A simple OBD-II scanner reads and clears engine fault codes in seconds. Paired with a phone app, it turns baffling warning lights into a clear diagnosis. It pays for itself the first time it saves you a trip to the shop.

With these five tools, a set of screwdrivers, and a few basics, you are equipped for most maintenance and many repairs. Start small, work safely, and enjoy the process.`,
  },
  {
    slug: "road-trip-cairo-to-the-red-sea",
    title: "Road Trip: Cairo to the Red Sea in a Convertible",
    excerpt:
      "Six hours of open road, desert light, and a coastal payoff. A first-hand account of the classic Cairo to Red Sea run.",
    publishedAt: "2026-07-03T09:00:00.000Z",
    contentEn: `There is a stretch of road that every Egyptian car enthusiast knows: the long, straight run from Cairo east to the Red Sea coast. In a convertible, with the roof down and the desert on either side, it becomes something more than a drive — it is an escape.

We left Cairo early, before the city fully woke, and headed down the Suez Road. The sky was a pale gold, and the air still carried the cool of the night. With the top down, the morning was a blessing. The first hour is the busiest, as trucks and commuters share the highway, so we kept a steady pace and let the convertible do the talking.

Past Suez, the road opens up. The desert rolls out in every direction, empty and enormous, and the horizon becomes a clean line of heat shimmer. The engine settled into a relaxed cruise, and the wind filled the cabin. This is the heart of the trip — hours of open road, the radio tuned low, and nothing but time.

We stopped at a roadside café for strong tea and watched the desert stretch away. The sun climbed, and the light grew brilliant and white. Convertible driving at midday is an art: we kept the speed up to keep the breeze moving, and the cabin stayed comfortable even as the heat rose.

By late afternoon the mountains of the Red Sea range appeared, and the road began to twist toward the coast. The colours changed — ochre, then deep red rock, then the first glimpse of brilliant blue water. We pulled into the resort town as the sun turned the sea to gold.

The drive back is a mirror image, but the memory is not. Six hours of open road, a car that loved every mile, and a coastline that rewards the journey. If you own a convertible, this is the run to make.`,
  },
  {
    slug: "understanding-vehicle-import-rules-egypt-and-gcc",
    title: "Understanding Vehicle Import Rules in Egypt and the GCC",
    excerpt:
      "Importing a car into Egypt or the GCC involves specific rules, taxes, and paperwork. Here is what you need to know.",
    publishedAt: "2026-07-14T09:00:00.000Z",
    contentEn: `Importing a vehicle into Egypt or the Gulf Cooperation Council (GCC) countries is a rewarding but rule-heavy process. Understanding the regulations before you buy a car abroad will save you time, money, and frustration. Here is a practical overview.

In Egypt, the import rules for personal vehicles are defined by age and engine size. The government generally restricts or heavily taxes imports of older cars, and customs duties rise steeply with engine capacity. Importers must be Egyptian nationals or residents with the proper documentation, including a valid import license, proof of ownership, and the original bill of sale. All vehicles must pass customs inspection and comply with national emission and safety standards.

In the GCC, the rules are more permissive but still strict. Each country — the UAE, Saudi Arabia, Qatar, Kuwait, Bahrain, and Oman — has its own import code, but common requirements apply. The vehicle must not be older than the specified age limit (often five years), must meet the GCC's emission and safety standards, and must be accompanied by the original title, invoices, and a certificate of origin. A good-condition inspection at the port is mandatory.

The GCC Spec standard is the key phrase to know. GCC-spec vehicles are built or adapted for the region's climate and fuel, and they are the easiest to register. Cars imported from other markets may require modification to the air conditioning, cooling system, and lighting before they pass inspection.

Across the region, the golden rule is the same: get every document in order, and confirm the vehicle's age and specifications against the destination country's rules before you commit. The right preparation turns a complex import into a smooth one.`,
  },
  {
    slug: "how-to-sell-your-car-online-step-by-step",
    title: "How to Sell Your Car Online: A Step-by-Step Guide",
    excerpt:
      "Selling your car online is easier than ever — if you do it right. Here is a step-by-step guide to a faster, fairer sale.",
    publishedAt: "2026-07-24T09:00:00.000Z",
    contentEn: `Selling your car online no longer means weeks of waiting and haggling. With the right approach, you can reach serious buyers and close a fair deal quickly. Here is a step-by-step guide.

Step 1: Prepare the car. A clean car sells faster and for more money. Wash it inside and out, clear the cabin of personal items, and address any small, cheap-to-fix issues like a burnt-out bulb or a cracked mirror. A full service and oil change adds confidence and value.

Step 2: Gather your paperwork. Have the title, registration, service history, and any repair invoices ready. Photograph every document. A complete file makes your car look credible and keeps the buyer's questions to a minimum.

Step 3: Take great photos. Shoot in daylight, in a clean location, and capture all angles: front, rear, both sides, interior, engine bay, and wheels. Include close-ups of the odometer and any notable features. A dozen good photos outperform fifty blurry ones.

Step 4: Write an honest listing. Describe the car accurately — the condition, the maintenance history, any known issues, and the reason for selling. Being upfront about flaws builds trust and reduces wasted viewings. Price it realistically by researching comparable cars.

Step 5: Publish and respond. List on the major platforms and respond to enquiries promptly. A quick, courteous reply is often the difference between a sale and a missed opportunity.

Step 6: Meet safely and complete the transfer. Arrange viewings in a safe public place, bring a friend, and complete the paperwork and payment securely. On a platform like Fidelis Auto, the process is handled cleanly and transparently.

Follow these steps and you will sell your car faster, for a better price, and with far less stress.`,
  },
  {
    slug: "best-weekend-cars-under-50000",
    title: "The Best Weekend Cars Under $50,000",
    excerpt:
      "You do not need a fortune to have a brilliant weekend car. Here are the best enthusiast picks under $50,000.",
    publishedAt: "2026-08-01T09:00:00.000Z",
    contentEn: `A weekend car is not about practicality — it is about joy. And you do not need a fortune to have one. Under $50,000, there has never been a better selection of cars that deliver pure driving pleasure. Here are our favourites.

The Mazda MX-5 is the perennial answer. Rear-wheel drive, a light body, and a near-perfect balance make it the most fun car you can buy for the money. It is affordable, reliable, and endlessly enjoyable whether on a twisty road or a coastal cruise.

If you want rear-seat practicality with real pace, the Ford Mustang GT is hard to beat. A naturally aspirated V8, a manual gearbox, and a soundtrack that justifies the whole purchase — it is a muscle car that also handles its business in the corners.

For refinement, the BMW M240i is a planted, fast, and comfortable gran tourer. Its turbocharged six-cylinder hauls it to 60 mph in well under five seconds, yet it remains a relaxed car to drive every day. It is the sensible enthusiast's choice.

The Toyota GR86 and its Subaru BRZ sibling are the purest handling cars in the class. Light, low, and wonderfully communicative, they reward a skilled driver and are cheap to maintain. They are proof that horsepower is not everything.

Finally, the Porsche Boxster — even an older one — delivers the mid-engined balance and badge prestige that nothing else at this price matches. A well-maintained 987-generation Boxster is an incredible value.

Whichever you choose, buy the best example you can afford, keep it maintained, and drive it. A weekend car is a promise to yourself — and the open road is waiting.`,
  },
];

async function main() {
  console.log("Seeding journal entries...");

  for (const entry of entries) {
    await prisma.journalEntry.upsert({
      where: { slug: entry.slug },
      update: {
        title: entry.title,
        author: "Fidelis Auto",
        contentEn: entry.contentEn,
        excerpt: entry.excerpt,
        coverImage: null,
        isPublished: true,
        publishedAt: new Date(entry.publishedAt),
      },
      create: {
        slug: entry.slug,
        title: entry.title,
        author: "Fidelis Auto",
        contentEn: entry.contentEn,
        excerpt: entry.excerpt,
        coverImage: null,
        isPublished: true,
        publishedAt: new Date(entry.publishedAt),
      },
    });
    console.log(`  ✓ ${entry.title}`);
  }

  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });