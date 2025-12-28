"use client";

import { useSearchParams, useRouter } from "next/navigation";
import rawProducts from "@/data/raw/products.json";
import ProductCard from "@/components/ProductCard";

import {
  Product,
  RawProduct,
  ProductTag,
  RecommendedProduct,
} from "@/types/product";

/* ---------- types ---------- */

type Cm = {
  height: number;
  width: number;
  depth: number;
};

/* ---------- constants ---------- */

const ALLOWED_TAGS: ProductTag[] = [
  "best-fit",
  "also-fits",
  "recommended",
  "best-seller",
];

/* ---------- normalization ---------- */

function normalizeProducts(raw: RawProduct[]): Product[] {
  return raw.map((p) => ({
    ...p,
    tags: p.tags?.filter((t): t is ProductTag =>
      ALLOWED_TAGS.includes(t as ProductTag)
    ),
  }));
}

/* ---------- helpers ---------- */

function fits(space: Cm, locker: Cm) {
  if (
    locker.height <= space.height &&
    locker.width <= space.width &&
    locker.depth <= space.depth
  ) {
    return true;
  }

  const rotations = [
    [locker.width, locker.height, locker.depth],
    [locker.depth, locker.width, locker.height],
    [locker.height, locker.depth, locker.width],
  ];

  return rotations.some(
    ([h, w, d]) => h <= space.height && w <= space.width && d <= space.depth
  );
}

function recommend(
  products: Product[],
  space: Cm,
  limit = 50
): RecommendedProduct[] {
  const userVol = space.height * space.width * space.depth;

  return products
    .filter((p) => p.dimensions?.cm)
    .filter((p) => fits(space, p.dimensions.cm))
    .map((p) => {
      const d = p.dimensions.cm;
      const lockerVol = d.height * d.width * d.depth;

      return {
        ...p,
        _fitScore: Math.abs(userVol - lockerVol),
        _lockerVol: lockerVol,
      };
    })
    .sort((a, b) => {
      if (a._fitScore !== b._fitScore) {
        return a._fitScore - b._fitScore;
      }
      return b._lockerVol - a._lockerVol;
    })
    .slice(0, limit);
}

/* ---------- data ---------- */

const products = normalizeProducts(rawProducts);

/* ---------- page ---------- */

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

  // 🔑 Compute ONCE
  const allFits = recommend(products, space, 50);

  // const userVol = space.height * space.width * space.depth;


  const bestFit = allFits[0];
  const alsoFits = allFits.slice(1, 6);

  const bestSellers = allFits
    .filter((p) => p.tags?.includes("best-seller"))
    .slice(0, 4);

  const featured = allFits
    .filter((p) => p.tags?.includes("recommended"))
    .slice(0, 4);

  // const futureProof = allFits
  //   .filter((p) => {
  //     const ratio = p._lockerVol / userVol;
  //     return ratio > 1.1 && ratio <= 1.4;
  //   })
  //   .slice(0, 4);

  // const bigOptions = allFits
  //   .filter((p) => {
  //     const ratio = p._lockerVol / userVol;
  //     return ratio > 1.4;
  //   })
  //   .slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-3">
      <div className="mx-auto max-w-4xl w-full">
        {/* HEADER */}
        <h1 className="text-xl font-bold mb-1">Recommended Lockers</h1>

        <p className="text-sm text-gray-600 mb-4">
          Based on space:{" "}
          <strong>
            {unit === "cm"
              ? `${h} × ${w} × ${d} cm`
              : `${h} × ${w} × ${d} (converted from ft/in)`}
          </strong>
        </p>

        {/* NO RESULTS */}
        {allFits.length === 0 && (
          <div className="bg-white rounded-lg p-6 text-center">
            <p className="font-medium mb-2">No locker fits this exact space.</p>
            <button
              className="mt-3 underline text-sm"
              onClick={() => router.push("/locker-recommender")}
            >
              Change measurements
            </button>
          </div>
        )}

        {/* BEST FIT */}
        {bestFit && (
          <>
            <h2 className="text-sm font-semibold mb-2">
              ⭐ Best Fit for Your Space
            </h2>

            <ProductCard
              product={bestFit}
              unit={unit}
              recommendationType="best-fit"
              position={0}
            />
          </>
        )}

        {/* ALSO FITS */}
        {alsoFits.length > 0 && (
          <>
            <h3 className="text-sm font-semibold mt-4 mb-2">
              Also Fits Your Space
            </h3>

            {alsoFits.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                unit={unit}
                recommendationType="also-fits"
                position={index + 1}
              />
            ))}
          </>
        )}

        {/* BEST SELLERS */}
        {bestSellers.length > 0 && (
          <>
            <h3 className="text-sm font-semibold mt-6 mb-2">🔥 Best Sellers</h3>

            {bestSellers.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                unit={unit}
                recommendationType="recommended"
                position={index}
              />
            ))}
          </>
        )}

        {/* FEATURED / EXPERT PICKS */}
        {featured.length > 0 && (
          <>
            <h3 className="text-sm font-semibold mt-6 mb-2">
              ⭐ Expert Recommended
            </h3>

            {featured.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                unit={unit}
                recommendationType="recommended"
                position={index}
              />
            ))}
          </>
        )}
      </div>

      {/* testing */}

    </div>
  );
}
