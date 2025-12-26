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

type Step = "brand" | "measure";
type Unit = "ftin" | "cm";

type Measure = {
  ft: number;
  in: number;
  cm: number;
};

/* -------------------- page -------------------- */

export default function LockerRecommenderPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("measure");
  const [unit, setUnit] = useState<Unit>("ftin");

  const [height, setHeight] = useState<Measure>({ ft: 3, in: 0, cm: 90 });
  const [width, setWidth] = useState<Measure>({ ft: 2, in: 0, cm: 60 });
  const [depth, setDepth] = useState<Measure>({ ft: 1, in: 9, cm: 55 });

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

    if (h <= 0 || w <= 0 || d <= 0) return;

    router.push(
      `/locker-recommender/results?h=${h}&w=${w}&d=${d}&unit=${unit}`
    );
  }

  /* -------------------- UI -------------------- */

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* ---------------- MEASURE STEP ---------------- */}
        {step === "measure" && (
          <Card>
            {/* <CardHeader>
              <CardTitle>Measure your available space</CardTitle>
            </CardHeader> */}

            <CardContent className="space-y-6">
              <ToggleGroup
                type="single"
                value={unit}
                onValueChange={(v) => {
                  if (!v) return;
                  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                  v === "cm" ? switchToCm() : switchToFtIn();
                }}
                className="justify-center"
              >
                <ToggleGroupItem
                  value="ftin"
                  className="px-4 data-[state=on]:bg-emerald-600 data-[state=on]:text-white data-[state=on]:border-emerald-600"
                >
                  Feet / Inches{" "}
                </ToggleGroupItem>
                <ToggleGroupItem
                  className="px-4 data-[state=on]:bg-emerald-600 data-[state=on]:text-white data-[state=on]:border-emerald-600"value="cm"
                >
                  CM
                </ToggleGroupItem>
              </ToggleGroup>

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

              <Button className="w-full" onClick={goToResults}>
                See Recommended Lockers
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
