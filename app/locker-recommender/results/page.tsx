import { Suspense } from "react";
import ResultsClient from "./ResultsClients";

export default function ResultsPage() {
  return (
    <Suspense fallback={<div className="p-4">Loading results…</div>}>
      <ResultsClient />
    </Suspense>
  );
}



// "use client";

// import { useSearchParams, useRouter } from "next/navigation";
// import products from "@/data/raw/products.json";
// import Image from "next/image";

// /* -------------------- types -------------------- */

// type Cm = {
//   height: number;
//   width: number;
//   depth: number;
// };

// /* -------------------- helpers -------------------- */

// // Fit check with rotation
// function fits(space: Cm, locker: Cm) {
//   if (
//     locker.height <= space.height &&
//     locker.width <= space.width &&
//     locker.depth <= space.depth
//   ) {
//     return true;
//   }

//   const rotations = [
//     [locker.width, locker.height, locker.depth],
//     [locker.depth, locker.width, locker.height],
//     [locker.height, locker.depth, locker.width],
//     [locker.width, locker.depth, locker.height],
//     [locker.depth, locker.height, locker.width],
//   ];

//   return rotations.some(
//     ([h, w, d]) => h <= space.height && w <= space.width && d <= space.depth
//   );
// }

// // Recommend best products
// function recommend(products: any[], space: Cm, limit = 3) {
//   const userVol = space.height * space.width * space.depth;

//   return products
//     .filter((p) => p.dimensions?.cm)
//     .map((p) => {
//       const d = p.dimensions.cm;
//       if (!fits(space, d)) return null;

//       const vol = d.height * d.width * d.depth;
//       return { ...p, _score: Math.abs(userVol - vol) };
//     })
//     .filter(Boolean)
//     .sort((a, b) => a._score - b._score)
//     .slice(0, limit);
// }

// // CM → FT/IN text
// function cmToFtInText(cm: number) {
//   const totalInches = cm / 2.54;
//   const ft = Math.floor(totalInches / 12);
//   const inch = Math.round(totalInches % 12);
//   return `${ft} ft ${inch} in`;
// }

// /* -------------------- page -------------------- */

// export default function LockerResultsPage() {
//   const params = useSearchParams();
//   const router = useRouter();

//   const h = Number(params.get("h"));
//   const w = Number(params.get("w"));
//   const d = Number(params.get("d"));
//   const unit = params.get("unit") === "ftin" ? "ftin" : "cm";

//   if (!h || !w || !d) {
//     router.replace("/locker-recommender");
//     return null;
//   }

//   const space: Cm = { height: h, width: w, depth: d };
//   const results = recommend(products, space);

//   return (
//     <div className="min-h-screen bg-gray-50 p-4 flex items-center">
//       <div className="mx-auto max-w-4xl w-full">

//         {/* HEADER */}
//         {/* <div className="mb-6">
//           <h1 className="text-xl sm:text-2xl font-bold mb-1">
//             Recommended Lockers for Your Space
//           </h1>
//           <p className="text-sm text-gray-600">
//             Based on available space:{" "}
//             <strong>
//               {unit === "ftin"
//                 ? `${cmToFtInText(h)} × ${cmToFtInText(w)} × ${cmToFtInText(d)}`
//                 : `${h} × ${w} × ${d} cm`}
//             </strong>
//           </p>
//           <p className="text-xs text-gray-500 mt-1">
//             Measurements shown in {unit === "ftin" ? "feet & inches" : "centimeters"}
//           </p>
//         </div> */}

//         {/* NO RESULTS */}
//         {results.length === 0 && (
//           <div className="bg-white rounded-lg p-6 text-center">
//             <p className="font-medium mb-2">No locker fits this exact space.</p>
//             <p className="text-sm text-gray-600">
//               Try increasing any dimension slightly.
//             </p>

//             <button
//               className="mt-4 underline text-sm"
//               onClick={() => router.push("/locker-recommender")}
//             >
//               Change measurements
//             </button>
//           </div>
//         )}

//         {/* RESULTS */}
//         <div className="space-y-4">
//           {results.map((p: any) => {
//             const dim = p.dimensions.cm;

//             return (
//               <div
//                 key={p.id}
// className="flex items-center gap-3 sm:gap-4 border-b pb-2 sm:pb-3 text-left"

//               >
//                 {/* IMAGE */}
//                 <div className="relative w-28 aspect-[3/4] sm:w-40 sm:aspect-[3/4] shrink-0 overflow-hidden bg-white">
//                   <Image
//                     src={p.images?.[0]}
//                     alt={p.name}
//                     fill
//                     className="object-contain scale-[1.70]"
//                   />
//                 </div>

//                 {/* DETAILS */}
//                 <div className="flex-1">
//                   <h2 className="font-semibold mb-1">{p.name}</h2>

//                   <p className="text-sm">
//                     Size:{" "}
//                     {unit === "ftin"
//                       ? `${cmToFtInText(dim.height)} × ${cmToFtInText(dim.width)} × ${cmToFtInText(dim.depth)}`
//                       : `${dim.height} × ${dim.width} × ${dim.depth} cm`}
//                   </p>

//                   <p className="text-sm">Volume: {p.volume}</p>
//                   <p className="text-sm">Weight: {p.weight}</p>

//                   <p className="text-xs text-emerald-700 font-semibold mt-1">
//                     ✔ Fits your space with minimal wasted room
//                   </p>
//                 </div>
//               </div>
//             );
//           })}
//         </div>

//         {/* CTA */}
//         {results.length > 0 && (
//           <div className="mt-8 bg-white rounded-lg p-4 text-center">
//             <p className="text-sm mb-3">
//               Want help choosing the best option?
//             </p>

//             <div className="flex gap-3 justify-center">
//               <a
//                 href="tel:+91XXXXXXXXXX"
//                 className="border px-4 py-2 rounded"
//               >
//                 📞 Call
//               </a>
//               <a
//                 href={`https://wa.me/91XXXXXXXXXX?text=${encodeURIComponent(
//                   `I measured my space as ${
//                     unit === "ftin"
//                       ? `${cmToFtInText(h)} × ${cmToFtInText(w)} × ${cmToFtInText(d)}`
//                       : `${h} × ${w} × ${d} cm`
//                   }. Please suggest the best locker.`
//                 )}`}
//                 className="bg-emerald-600 text-white px-4 py-2 rounded"
//               >
//                 💬 WhatsApp
//               </a>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
