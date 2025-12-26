"use client";

import { useSearchParams, useRouter } from "next/navigation";
import products from "@/data/raw/products.json";
import Image from "next/image";

type Cm = {
  height: number;
  width: number;
  depth: number;
};

function fits(space: Cm, locker: Cm) {
  if (
    locker.height <= space.height &&
    locker.width <= space.width &&
    locker.depth <= space.depth
  ) return true;

  const rotations = [
    [locker.width, locker.height, locker.depth],
    [locker.depth, locker.width, locker.height],
    [locker.height, locker.depth, locker.width],
  ];

  return rotations.some(
    ([h, w, d]) => h <= space.height && w <= space.width && d <= space.depth
  );
}

function recommend(products: any[], space: Cm, limit = 3) {
  const userVol = space.height * space.width * space.depth;

  return products
    .filter((p) => p.dimensions?.cm)
    .map((p) => {
      const d = p.dimensions.cm;
      if (!fits(space, d)) return null;

      const vol = d.height * d.width * d.depth;
      return { ...p, _score: Math.abs(userVol - vol) };
    })
    .filter(Boolean)
    .sort((a, b) => a._score - b._score)
    .slice(0, limit);
}

function cmToFtInText(cm: number) {
  const totalInches = cm / 2.54;
  const ft = Math.floor(totalInches / 12);
  const inch = Math.round(totalInches % 12);
  return `${ft} ft ${inch} in`;
}

export default function ResultsClient() {
  const params = useSearchParams();
  const router = useRouter();

  const h = Number(params.get("h"));
  const w = Number(params.get("w"));
  const d = Number(params.get("d"));
  const unit = params.get("unit") === "ftin" ? "ftin" : "cm";

  if (!h || !w || !d) {
    router.replace("/locker-recommender");
    return null;
  }

  const space: Cm = { height: h, width: w, depth: d };
  const results = recommend(products, space);

  return (
    <div className="min-h-screen bg-gray-50 pt-2 pb-2 px-4">
      <div className="mx-auto max-w-4xl w-full">
        <h1 className="text-xl font-bold mb-1">
          Recommended Lockers
        </h1>

        <p className="text-sm text-gray-600 mb-4">
          Based on space:{" "}
          <strong>
            {unit === "ftin"
              ? `${cmToFtInText(h)} × ${cmToFtInText(w)} × ${cmToFtInText(d)}`
              : `${h} × ${w} × ${d} cm`}
          </strong>
        </p>

        {results.map((p: any) => {
          const dim = p.dimensions.cm;
          return (
            <div
              key={p.id}
              className="flex items-center gap-3 border-b pb-2"
            >
              <div className="relative w-28 aspect-[3/4] shrink-0">
                <Image
                  src={p.images?.[0]}
                  alt={p.name}
                  fill
                  className="object-contain scale-[1.6]"
                />
              </div>

              <div className="flex-1">
                <h2 className="font-semibold">{p.name}</h2>
                <p className="text-sm">
                  Size:{" "}
                  {unit === "ftin"
                    ? `${cmToFtInText(dim.height)} × ${cmToFtInText(dim.width)} × ${cmToFtInText(dim.depth)}`
                    : `${dim.height} × ${dim.width} × ${dim.depth} cm`}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
