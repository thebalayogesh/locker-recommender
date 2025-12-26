"use client";

import Image from "next/image";
import products from "@/data/raw/products.json";

function getSizes(sizeArr: string[]) {
  const cm = sizeArr.find((s) => s.includes("(cm)")) || "";
  const mm = sizeArr.find((s) => s.includes("(mm)")) || "";
  return {
    cm: cm.replace("(cm)", "").trim(),
    mm: mm.replace("(mm)", "").trim(),
  };
}

export default function AllProductsPage() {
  return (
    <div className="mx-auto p-4 bg-white max-w-xl md:max-w-5xl">
      {/* <h1 className="text-xl sm:text-2xl font-bold mb-6">All Locker Models</h1> */}

      <div className="space-y-6">
        {products.map((p: any) => {
          const { cm, mm } = getSizes(p.size);

          return (
            <div
              key={p.id}
              className="flex items-center gap-4 sm:gap-6 border-b pb-4 sm:pb-6 text-left "
            >
              {/* LEFT IMAGE */}
              <div className="relative w-28 aspect-[3/4] sm:w-40 sm:aspect-[3/4] shrink-0 overflow-hidden bg-white">
                <Image
                  src={p.images?.[0]}
                  alt={p.name}
                  fill
                  className="object-contain scale-[1.80]"
                  sizes="(max-width: 640px) 112px, 160px"
                />
              </div>

              {/* RIGHT DETAILS */}
              <div className="flex-1">
                <h2 className="text-lg sm:text-lg font-semibold mb-1 sm:mb-2 leading-snug line-clamp-2">
                  {p.name}
                </h2>

                <div className="text-xs sm:text-sm text-gray-700 space-y-0.5 sm:space-y-1">
                  <p>
                    <span className="font-medium">Size :</span> (cm) {cm}
                  </p>

                  {mm && <p className="pl-8 sm:pl-12">(mm) {mm}</p>}

                  <p>
                    <span className="font-medium">Weight :</span> {p.weight}
                  </p>

                  <p>
                    <span className="font-medium">Volume :</span> {p.volume}
                  </p>

                  <p className="text-xs sm:text-sm text-gray-700">
                    <span className="font-medium">Lock Mechanism :</span>{" "}
                    {p.lock_mechanism
                      ?.map((lock: string) =>
                        lock
                          .replace(/_/g, " ")
                          .replace(/\b\w/g, (c) => c.toUpperCase())
                      )
                      .join(" + ")}
                  </p>
                </div>

              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
