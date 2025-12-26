"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

/* -------------------- helpers -------------------- */

function ftInToCm(ft: number, inch: number) {
  return ft * 30.48 + inch * 2.54;
}

function cmToFtIn(cm: number) {
  const totalInches = cm / 2.54;
  const ft = Math.floor(totalInches / 12);
  const inch = Math.round(totalInches % 12);
  return { ft, inch };
}

/* -------------------- types -------------------- */

type Step = "brand" | "measure" | "intent";
type Unit = "ftin" | "cm";

type Measure = {
  ft: number;
  in: number;
  cm: number;
};

/* -------------------- page -------------------- */

export default function LockerRecommenderPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("brand");
  const [unit, setUnit] = useState<Unit>("ftin");

  const [height, setHeight] = useState<Measure>({
    ft: 3,
    in: 0,
    cm: 90,
  });

  const [width, setWidth] = useState<Measure>({
    ft: 2,
    in: 0,
    cm: 60,
  });

  const [depth, setDepth] = useState<Measure>({
    ft: 1,
    in: 9,
    cm: 55,
  });

  /* -------------------- unit switch -------------------- */

  function switchToCm() {
    setHeight((h) => ({ ...h, cm: Math.round(ftInToCm(h.ft, h.in)) }));
    setWidth((w) => ({ ...w, cm: Math.round(ftInToCm(w.ft, w.in)) }));
    setDepth((d) => ({ ...d, cm: Math.round(ftInToCm(d.ft, d.in)) }));
    setUnit("cm");
  }

  function switchToFtIn() {
    const h = cmToFtIn(height.cm);
    const w = cmToFtIn(width.cm);
    const d = cmToFtIn(depth.cm);

    setHeight((v) => ({ ...v, ...h }));
    setWidth((v) => ({ ...v, ...w }));
    setDepth((v) => ({ ...v, ...d }));
    setUnit("ftin");
  }

  /* -------------------- submit -------------------- */

  function goToResults() {
    const h =
      unit === "cm" ? height.cm : Math.round(ftInToCm(height.ft, height.in));
    const w =
      unit === "cm" ? width.cm : Math.round(ftInToCm(width.ft, width.in));
    const d =
      unit === "cm" ? depth.cm : Math.round(ftInToCm(depth.ft, depth.in));

    router.push(`/locker-recommender/results?h=${h}&w=${w}&d=${d}`);
  }

  /* -------------------- UI -------------------- */

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* ---------------- BRAND STEP ---------------- */}
        {step === "brand" && (
          <Card className="border-none shadow-none">
            <CardContent className="py-10 text-center space-y-6">
              {/* Brand */}
              <div className="space-y-1">
                <h1 className="text-2xl font-bold tracking-tight">
                  Secure Home Solutions
                </h1>
                <p className="text-sm text-muted-foreground">
                  Trusted Locker Specialists
                </p>
              </div>

              {/* Value proposition */}
              <p className="text-base text-gray-700 leading-relaxed px-2">
                Find the <span className="font-medium">right locker</span> that
                fits your space perfectly — without guessing sizes or models.
              </p>

              {/* CTA */}
              <Button
                size="lg"
                className="w-full text-base font-semibold"
                onClick={() => setStep("measure")}
              >
                Find Your Locker
              </Button>

              {/* Trust micro-copy */}
              <p className="text-xs text-muted-foreground">
                Takes less than 1 minute · No signup required
              </p>
            </CardContent>
          </Card>
        )}

        {/* ---------------- MEASURE STEP ---------------- */}
        {step === "measure" && (
          <Card>
            <CardHeader>
              <CardTitle>Measure your available space</CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* UNIT TOGGLE */}
              <ToggleGroup
                type="single"
                value={unit}
                onValueChange={(v) => {
                  if (!v) return;
                  v === "cm" ? switchToCm() : switchToFtIn();
                }}
                className="justify-center"
              >
                <ToggleGroupItem value="ftin">Feet / Inches</ToggleGroupItem>
                <ToggleGroupItem value="cm">CM</ToggleGroupItem>
              </ToggleGroup>

              {/* INPUTS */}
              {[
                { label: "Height", state: height, set: setHeight },
                { label: "Width", state: width, set: setWidth },
                { label: "Depth", state: depth, set: setDepth },
              ].map(({ label, state, set }) => (
                <div key={label} className="space-y-2">
                  <Label>{label}</Label>

                  {unit === "ftin" ? (
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        value={state.ft}
                        onChange={(e) => set({ ...state, ft: +e.target.value })}
                        placeholder="ft"
                      />
                      <Input
                        type="number"
                        value={state.in}
                        onChange={(e) => set({ ...state, in: +e.target.value })}
                        placeholder="in"
                      />
                    </div>
                  ) : (
                    <Input
                      type="number"
                      value={state.cm}
                      onChange={(e) => set({ ...state, cm: +e.target.value })}
                      placeholder="cm"
                    />
                  )}
                </div>
              ))}

              <Button className="w-full" onClick={() => setStep("intent")}>
                Continue
              </Button>
            </CardContent>
          </Card>
        )}

        {/* ---------------- INTENT STEP ---------------- */}
        {step === "intent" && (
          <Card>
            <CardHeader>
              <CardTitle>When are you planning to buy?</CardTitle>
            </CardHeader>

            <CardContent className="space-y-3">
              {["Immediately", "Within a week", "Just exploring"].map((opt) => (
                <Button
                  key={opt}
                  variant="outline"
                  className="w-full justify-start"
                  onClick={goToResults}
                >
                  {opt}
                </Button>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
