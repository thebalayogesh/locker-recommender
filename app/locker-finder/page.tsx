"use client";

import { useMemo, useState } from "react";
import productsRaw from "@/data/raw/products.json";
import ProductCard from "@/app/ProductCard";

const SHEETS_API = "/api/lead"; // you will implement this
const WA_NUMBER = "91XXXXXXXXXX";

const STEPS = {
  BRAND: 0,
  LOCATION: 1,
  SPACE: 2,
  INTENT: 3,
  RESULT: 4,
};

function parseCmSize(sizeArr: string[]) {
  const cm = sizeArr?.find((s) => s.includes("(cm)"));
  if (!cm) return null;
  const m = cm
    .replace(/\s/g, "")
    .match(/([\d.]+)\(h\)x([\d.]+)\(w\)x([\d.]+)\(d\)/i);
  if (!m) return null;
  return { h: +m[1], w: +m[2], d: +m[3] };
}

function recommend(products: any[], space: any) {
  const userVol = space.h * space.w * space.d;

  return products
    .map((p) => {
      const d = p._dims;
      const rotations = [
        [d.h, d.w, d.d],
        [d.w, d.h, d.d],
        [d.d, d.w, d.h],
      ];
      const fits = rotations.some(
        ([h, w, d]) => h <= space.h && w <= space.w && d <= space.d
      );
      if (!fits) return null;
      const vol = d.h * d.w * d.d;
      return { ...p, score: Math.abs(vol - userVol) };
    })
    .filter(Boolean)
    .sort((a, b) => a.score - b.score)
    .slice(0, 3);
}

export default function LockerFinderPage() {
  const products = useMemo(() => {
    return productsRaw
      .map((p: any) => {
        const dims = parseCmSize(p.size || []);
        if (!dims) return null;
        return { ...p, _dims: dims };
      })
      .filter(Boolean);
  }, []);

  const [step, setStep] = useState(STEPS.BRAND);

  const [location, setLocation] = useState("");
  const [h, setH] = useState(60);
  const [w, setW] = useState(50);
  const [d, setD] = useState(45);
  const [intent, setIntent] = useState("");

  const recommended = useMemo(() => {
    if (step !== STEPS.RESULT) return [];
    return recommend(products, { h, w, d });
  }, [step, h, w, d, products]);

  async function saveLead() {
    await fetch(SHEETS_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        location,
        space: { h, w, d },
        intent,
        source: "locker-finder",
        ts: new Date().toISOString(),
      }),
    });
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-xl mx-auto rounded-xl shadow p-6">
        {/* Brand Intro */}
        {step === STEPS.BRAND && (
          <>
            <h1 className="text-xl font-semibold text-center mb-1">
              Secure Home Solutions
            </h1>

            <p className="text-sm text-gray-500 text-center mb-4">
              Locker specialists · Space-based recommendations
            </p>

            <h2 className="text-2xl font-bold text-center mb-3">
              Find the Right Locker That Fits Your Space
            </h2>

            <p className="text-gray-600 text-center mb-6">
              Choosing the wrong size locker causes installation issues. We help
              you select lockers that fit your available space properly.
            </p>

            <button
              onClick={() => setStep(1)}
              className="w-full bg-black text-white py-3 rounded-lg text-lg font-medium"
            >
              Find Your Locker
            </button>

            <p className="text-sm text-gray-500 text-center mt-2">
              Takes less than a minute
            </p>
          </>
        )}

        {/* STEP INDICATOR */}
        <p className="text-sm text-gray-500 mb-4">Step {step} of 4</p>

        {/* STEP 1 */}
        {step === STEPS.LOCATION && (
          <>
            <h1 className="text-xl font-bold mb-2">
              Where will you install the locker?
            </h1>
            <p className="text-gray-600 mb-4">
              This helps us suggest the right size and model.
            </p>

            {["Bedroom", "Living Room", "Office", "Other"].map((opt) => (
              <button
                key={opt}
                onClick={() => {
                  setLocation(opt);
                  setStep(STEPS.SPACE);
                }}
                className="w-full border rounded-lg p-3 mb-2 text-left hover:bg-gray-100"
              >
                {opt}
              </button>
            ))}
          </>
        )}

        {/* STEP 2 */}
        {step === STEPS.SPACE && (
          <>
            <h2 className="text-xl font-bold mb-2">
              Measure the available space
            </h2>
            <p className="text-gray-600 mb-4">
              Lockers must fit your space properly. We recommend only models
              that fit without modification.
            </p>

            <div className="grid grid-cols-3 gap-2 mb-4">
              <input
                value={h}
                onChange={(e) => setH(+e.target.value)}
                placeholder="Height (cm)"
                className="border p-2 rounded"
              />
              <input
                value={w}
                onChange={(e) => setW(+e.target.value)}
                placeholder="Width (cm)"
                className="border p-2 rounded"
              />
              <input
                value={d}
                onChange={(e) => setD(+e.target.value)}
                placeholder="Depth (cm)"
                className="border p-2 rounded"
              />
            </div>

            <button
              onClick={() => setStep(STEPS.INTENT)}
              className="w-full bg-black text-white py-3 rounded-lg"
            >
              Continue
            </button>
          </>
        )}

        {/* STEP 3 */}
        {step === STEPS.INTENT && (
          <>
            <h2 className="text-xl font-bold mb-2">
              When are you planning to buy?
            </h2>

            {["Immediately", "Within 1 week", "Just exploring"].map((opt) => (
              <button
                key={opt}
                onClick={async () => {
                  setIntent(opt);
                  await saveLead();
                  setStep(STEPS.RESULT);
                }}
                className="w-full border rounded-lg p-3 mb-2 text-left hover:bg-gray-100"
              >
                {opt}
              </button>
            ))}
          </>
        )}

        {/* STEP 4 */}
        {step === STEPS.RESULT && (
          <>
            <h2 className="text-xl font-bold mb-2">
              Recommended for your space
            </h2>
            <p className="text-gray-600 mb-4">
              These lockers fit your available space based on your measurements.
            </p>

            {recommended.map((p: any) => (
              <ProductCard key={p.id} product={p} />
            ))}

            <div className="mt-6 space-y-3">
              <a
                href={`tel:+91XXXXXXXXXX`}
                className="block text-center border py-3 rounded-lg font-medium"
              >
                📞 Call for Best Price
              </a>

              <a
                href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(
                  `I measured my space as ${h}×${w}×${d} cm. Please suggest the best locker.`
                )}`}
                target="_blank"
                className="block text-center bg-emerald-600 text-white py-3 rounded-lg font-medium"
              >
                💬 Get Quote on WhatsApp
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
