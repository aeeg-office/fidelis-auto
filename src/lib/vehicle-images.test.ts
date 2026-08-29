import { describe, expect, it, vi } from "vitest";
import { normalizeImageOrder, syncVehicleImages } from "./vehicle-images";

type Row = { id: string; vehicleId: string; src: string; sortOrder: number; isPrimary: boolean };

describe("normalizeImageOrder", () => {
  it("accepts a valid ordered list with id/src/cover", () => {
    const input = [
      { id: "a", src: "/uploads/1.jpg", cover: true },
      { src: "/uploads/2.jpg" },
    ];
    expect(normalizeImageOrder(input)).toEqual([
      { id: "a", src: "/uploads/1.jpg", cover: true },
      { id: null, src: "/uploads/2.jpg", cover: false },
    ]);
  });

  it("rejects >30 images", () => {
    const big = Array.from({ length: 31 }, (_, i) => ({ src: `/uploads/${i}.jpg` }));
    expect(normalizeImageOrder(big)).toBeNull();
  });

  it("rejects non-arrays and malformed items", () => {
    expect(normalizeImageOrder("nope" as unknown)).toBeNull();
    expect(normalizeImageOrder(null as unknown)).toBeNull();
    expect(normalizeImageOrder([{ src: 123 }] as unknown)).toBeNull();
    expect(normalizeImageOrder([{ id: "x" }] as unknown)).toBeNull();
    expect(normalizeImageOrder([])).toEqual([]);
  });
});

/** Build a fake prisma shim exposing only the ops syncVehicleImages needs. */
function makeShim() {
  let rows: Row[] = [];
  const prisma = {
    vehicleImage: {
      findMany: vi.fn(async ({ where }: { where: { vehicleId: string } }) =>
        rows.filter((r) => r.vehicleId === where.vehicleId),
      ),
      update: vi.fn(async ({ where, data }: { where: { id: string }; data: Partial<Row> }) => {
        const r = rows.find((x) => x.id === where.id)!;
        Object.assign(r, data);
        return r;
      }),
      create: vi.fn(async ({ data }: { data: Omit<Row, "id"> }) => {
        const r: Row = { id: `new-${rows.length + 1}`, ...data };
        rows.push(r);
        return r;
      }),
      deleteMany: vi.fn(async ({ where }: { where: { id?: { in: string[] } | undefined; vehicleId?: string } }) => {
        const before = rows.length;
        if (where.vehicleId && !where.id) rows = rows.filter((r) => r.vehicleId !== where.vehicleId);
        else if (where.id?.in) {
          const ids = where.id.in;
          rows = rows.filter((r) => !ids.includes(r.id));
        }
        return { count: before - rows.length };
      }),
    },
    $transaction: vi.fn(async <T,>(fn: (p: typeof prisma) => Promise<T>) => fn(prisma as any)),
  };
  const seed = (id: string, src: string, sortOrder: number, isPrimary: boolean) =>
    rows.push({ id, vehicleId: "v1", src, sortOrder, isPrimary });
  return { prisma, seed, rows: () => [...rows] };
}

describe("syncVehicleImages", () => {
  it("sets cover, reorders, keeps retained, deletes removed, creates new", async () => {
    const { prisma, seed, rows } = makeShim();
    seed("img-a", "/uploads/1.jpg", 0, true);
    seed("img-b", "/uploads/2.jpg", 1, false);
    seed("img-c", "/uploads/3.jpg", 2, false);

    const result = await syncVehicleImages(prisma as never, "v1", [
      { id: "img-c", src: "/uploads/3.jpg", cover: true },
      { id: "img-a", src: "/uploads/1.jpg" },
      { src: "/uploads/new1.jpg" },
      { src: "/uploads/new2.jpg" },
    ], { deleteFiles: false });

    expect(result.cover).toBe("/uploads/3.jpg");
    expect(result.deleted).toBe(1); // img-b dropped
    expect(result.created).toBe(2); // new1, new2

    const final = rows();
    expect(final).toHaveLength(4);
    const ordered = [...final].sort((a, b) => a.sortOrder - b.sortOrder);
    expect(ordered.map((r) => r.src)).toEqual([
      "/uploads/3.jpg", "/uploads/1.jpg", "/uploads/new1.jpg", "/uploads/new2.jpg",
    ]);
    expect(ordered[0].isPrimary).toBe(true);
    expect(final.filter((r) => r.isPrimary)).toHaveLength(1);
    expect(final.some((r) => r.id === "img-b")).toBe(false);
  });

  it("emptying the list deletes all images", async () => {
    const { prisma, seed, rows } = makeShim();
    seed("img-a", "/uploads/1.jpg", 0, true);
    seed("img-b", "/uploads/2.jpg", 1, false);

    const result = await syncVehicleImages(prisma as never, "v1", []);
    expect(result).toEqual({ created: 0, deleted: 2, cover: null });
    expect(rows()).toHaveLength(0);
  });

  it("falls back to the first image as cover when none flagged", async () => {
    const { prisma, seed, rows } = makeShim();
    seed("img-a", "/uploads/1.jpg", 0, true);
    const result = await syncVehicleImages(prisma as never, "v1", [
      { id: "img-a", src: "/uploads/1.jpg" },
      { src: "/uploads/2.jpg" },
    ]);
    expect(result.cover).toBe("/uploads/1.jpg");
    expect(rows()[0].isPrimary).toBe(true);
    expect(rows().filter((r) => r.isPrimary)).toHaveLength(1);
  });
});