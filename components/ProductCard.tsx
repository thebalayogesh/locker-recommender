"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

import { Product } from "@/types/product";

type Cm = {
  height: number;
  width: number;
  depth: number;
};

type ProductCardProps = {
  product: Product;
  unit: "ftin" | "cm";
  recommendationType: "best-fit" | "also-fits" | "recommended";
  position: number;
};


const WA_NUMBER = "91XXXXXXXXXX";

/* ---------- helpers ---------- */

function cmToFtInText(cm: number) {
  const totalInches = cm / 2.54;
  const ft = Math.floor(totalInches / 12);
  const inch = Math.round(totalInches % 12);
  return `${ft}' ${inch}"`;
}

function getBadge(tag: string) {
  switch (tag) {
    case "best-fit":
      return { text: "⭐ Best Fit", className: "bg-emerald-600 text-white" };
    case "also-fits":
      return { text: "Also Fits", className: "bg-gray-100 text-gray-800" };
    case "recommended":
      return { text: "Recommended", className: "bg-blue-100 text-blue-800" };
    case "best-seller":
      return { text: "Best Seller", className: "bg-amber-100 text-amber-800" };
    default:
      return null;
  }
}

/* ---------- component ---------- */

export default function ProductCard({ product, unit }: ProductCardProps) {
  const router = useRouter();

  if (!product?.dimensions?.cm) return null;

  const dim: Cm = product.dimensions.cm;
  const category = product.category?.[0] || "lockers";

  const productUrl = `https://homelockers.in/products/${category}/${product.slug}`;

  const waText = encodeURIComponent(
    `Hi, I'm interested in this locker:\n${product.name}\n${productUrl}`
  );

  return (
    <div  
      onClick={() => router.push(`/products/${category}/${product.slug}`)}
      className="flex items-center gap-3 border-b pb-2 mb-2 overflow-hidden text-left cursor-pointer hover:bg-gray-50 transition"
    >
      {/* IMAGE */}
      <div className="relative w-28 aspect-3/4 shrink-0 bg-white overflow-hidden">
        <Image
          src={product.images?.[0]}
          alt={product.name}
          fill
          className="object-contain scale-[1.8] translate-y-1"
          sizes="112px"
        />

        {/* BADGES */}
        <div className="absolute top-1 left-1 space-y-1">
          {product.tags?.map((tag: string) => {
            const badge = getBadge(tag);
            if (!badge) return null;

            return (
              <span
                key={tag}
                className={`text-[10px] px-2 py-0.5 rounded font-medium ${badge.className}`}
              >
                {badge.text}
              </span>
            );
          })}
        </div>
      </div>

      {/* DETAILS */}
      <div className="flex-1">
        <h2 className="font-semibold leading-snug line-clamp-2">
          {product.name}
        </h2>

        <p className="text-sm text-gray-700">
          Size:{" "}
          {unit === "ftin"
            ? `${cmToFtInText(dim.height)} (h) × ${cmToFtInText(
                dim.width
              )} (w) × ${cmToFtInText(dim.depth)} (d)`
            : `${dim.height} (h) × ${dim.width} (w) × ${dim.depth} (d) cm`}
        </p>

        {product.weight && (
          <p className="text-sm text-gray-700">Weight: {product.weight}</p>
        )}

        {product.volume && (
          <p className="text-sm text-gray-700">Volume: {product.volume}</p>
        )}

        {/* ACTION ROW */}
        <div className="mt-1 flex items-center gap-2">
          <span className="text-xs text-emerald-700 font-semibold">
            ✔ Fits your space
          </span>

          <a
            href={`https://wa.me/${WA_NUMBER}?text=${waText}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="ml-auto flex items-center justify-center p-1 rounded hover:bg-green-50"
            aria-label="Chat on WhatsApp"
          >
            <Image
              src="/images/whatsapp.png"
              alt="WhatsApp"
              width={20}
              height={20}
              className="object-contain"
            />
          </a>
        </div>
      </div>
    </div>
  );
}
