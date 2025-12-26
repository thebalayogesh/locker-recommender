"use client";

import Image from "next/image";

function getSizes(sizeArr: string[]) {
  const cm = sizeArr.find((s) => s.includes("(cm)")) || "";
  const mm = sizeArr.find((s) => s.includes("(mm)")) || "";
  return {
    cm: cm.replace("(cm)", "").trim(),
    mm: mm.replace("(mm)", "").trim(),
  };
}

function formatLock(lock: string) {
  return lock
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function SingleProductCard({ product }: { product: any }) {
  const { cm, mm } = getSizes(product.size || []);

  return (
    <div className="flex items-center gap-4 sm:gap-6 border-b pb-4 sm:pb-6 text-left">
      {/* IMAGE */}
      <div className="relative w-28 aspect-3/4 sm:w-40 sm:aspect-3/4 shrink-0 overflow-hidden bg-white">
        <Image
          src={product.images?.[0]}
          alt={product.name}
          fill
          className="object-contain scale-[1.8]"
          sizes="(max-width: 640px) 112px, 160px"
        />
      </div>

      {/* DETAILS */}
      <div className="flex-1">
        <h2 className="text-sm sm:text-lg font-semibold mb-1 leading-snug line-clamp-2">
          {product.name}
        </h2>

        <div className="text-xs sm:text-sm text-gray-700 space-y-0.5">
          <p>
            <span className="font-medium">Size :</span> (cm) {cm}
          </p>

          {mm && <p className="pl-8 sm:pl-12">(mm) {mm}</p>}

          <p>
            <span className="font-medium">Weight :</span> {product.weight}
          </p>

          <p>
            <span className="font-medium">Volume :</span> {product.volume}
          </p>

          {product.lock_mechanism?.length > 0 && (
            <p>
              <span className="font-medium">Lock Mechanism :</span>{" "}
              {product.lock_mechanism
                .map((lock: string) => formatLock(lock))
                .join(" + ")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
