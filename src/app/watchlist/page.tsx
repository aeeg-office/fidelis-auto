import { redirect } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { Heart, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/user-auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "My Watchlist",
  description: "Vehicles you have saved to your Fidelis Auto watchlist.",
};

export default async function WatchlistPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirect=/watchlist");

  const favorites = await prisma.favorite.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      vehicle: {
        select: {
          id: true,
          slug: true,
          title: true,
          year: true,
          make: true,
          model: true,
          trim: true,
          price: true,
          status: true,
          images: { where: { isPrimary: true }, take: 1, select: { src: true } },
        },
      },
    },
  });

  const items = favorites;

  return (
    <div className="container-page py-16 md:py-24">
      <div className="max-w-4xl mx-auto">
        <header className="mb-10">
          <h1 className="font-[family-name:var(--font-cormorant)] text-4xl md:text-5xl font-semibold text-[var(--color-text-primary)] mb-3">
            My Watchlist
          </h1>
          <p className="text-[var(--color-text-secondary)] max-w-xl">
            Vehicles you have saved for later. Check availability and compare before you decide.
          </p>
        </header>

        {items.length === 0 ? (
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-12 text-center">
            <Heart size={40} className="mx-auto text-[var(--color-text-secondary)]/40 mb-4" />
            <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">Your watchlist is empty</h2>
            <p className="text-sm text-[var(--color-text-secondary)] mt-2 mb-6 max-w-md mx-auto">
              Save vehicles you are interested in and they will appear here so you can compare and decide with confidence.
            </p>
            <Link
              href="/vehicles"
              className="inline-flex items-center gap-2 bg-[var(--color-accent)] text-[var(--color-surface-dark)] px-5 py-2.5 rounded-lg font-medium hover:bg-[var(--color-accent-hover)] transition-colors"
            >
              Browse the Collection <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {items.map((f) => {
              const v = f.vehicle;
              const img = v.images?.[0]?.src || null;
              return (
                <Link
                  key={f.id}
                  href={`/vehicles/${v.slug}`}
                  className="group flex items-center gap-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 transition-colors hover:border-[var(--color-accent)]"
                >
                  <div className="w-28 h-20 rounded-lg bg-[var(--color-surface-dark)] overflow-hidden shrink-0 flex items-center justify-center">
                    {img ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={img} alt={v.title} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs text-[var(--color-text-secondary)]">No photo</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="font-[family-name:var(--font-cormorant)] text-lg font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] transition-colors truncate">
                      {v.title}
                    </h2>
                    <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">
                      {v.year} {v.make} {v.model}{v.trim ? ` ${v.trim}` : ""}
                    </p>
                    {v.price && (
                      <p className="text-sm font-medium text-[var(--color-accent)] mt-1">{v.price}</p>
                    )}
                  </div>
                  <span className="shrink-0 text-[var(--color-accent)] flex items-center gap-1 text-sm">
                    View <ArrowRight size={15} />
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}