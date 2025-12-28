"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Card, CardContent } from "@/components/ui/card";
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

// allow only digits, no cursor break
function sanitize(value: string) {
  return value.replace(/\D/g, "");
}

/* -------------------- types -------------------- */

type Unit = "ftin" | "cm";

type Measure = {
  ft: string;
  in: string;
  cm: string;
};

/* -------------------- page -------------------- */

export default function LockerRecommenderPage() {
  const router = useRouter();
  const [unit, setUnit] = useState<Unit>("ftin");

  const [height, setHeight] = useState<Measure>({
    ft: "3",
    in: "0",
    cm: "90",
  });

  const [width, setWidth] = useState<Measure>({
    ft: "2",
    in: "0",
    cm: "60",
  });

  const [depth, setDepth] = useState<Measure>({
    ft: "1",
    in: "9",
    cm: "55",
  });

  /* -------------------- unit switch -------------------- */

  function switchToCm() {
    setHeight(h => ({
      ...h,
      cm: String(Math.round(ftInToCm(Number(h.ft), Number(h.in)))),
    }));
    setWidth(w => ({
      ...w,
      cm: String(Math.round(ftInToCm(Number(w.ft), Number(w.in)))),
    }));
    setDepth(d => ({
      ...d,
      cm: String(Math.round(ftInToCm(Number(d.ft), Number(d.in)))),
    }));
    setUnit("cm");
  }

  function switchToFtIn() {
    const h = cmToFtIn(Number(height.cm));
    const w = cmToFtIn(Number(width.cm));
    const d = cmToFtIn(Number(depth.cm));

    // setHeight(v => ({ ...v, ft: String(h.ft), in: String(h.in) }));
    // setWidth(v => ({ ...v, ft: String(w.ft), in: String(w.in) }));
    // setDepth(v => ({ ...v, ft: String(d.ft), in: String(d.in) }));
    setUnit("ftin");
  }

  /* -------------------- submit -------------------- */

  function goToResults() {
    const h =
      unit === "cm"
        ? Number(height.cm)
        : Math.round(ftInToCm(Number(height.ft), Number(height.in)));

    const w =
      unit === "cm"
        ? Number(width.cm)
        : Math.round(ftInToCm(Number(width.ft), Number(width.in)));

    const d =
      unit === "cm"
        ? Number(depth.cm)
        : Math.round(ftInToCm(Number(depth.ft), Number(depth.in)));

    if (!h || !w || !d) return;

    router.push(
      `/locker-recommender/results?h=${h}&w=${w}&d=${d}&unit=${unit}`
    );
  }

  /* -------------------- UI -------------------- */

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardContent className="space-y-6 pt-6">

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
              <ToggleGroupItem
                value="ftin"
                className="px-4 data-[state=on]:bg-emerald-600 data-[state=on]:text-white"
              >
                Feet / Inches
              </ToggleGroupItem>

              <ToggleGroupItem
                value="cm"
                className="px-4 data-[state=on]:bg-emerald-600 data-[state=on]:text-white"
              >
                CM
              </ToggleGroupItem>
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
                    <div className="relative w-1/2">
                      <Input
                        type="text"
                        value={state.ft}
                        onChange={(e) =>
                          set(v => ({ ...v, ft: sanitize(e.target.value) }))
                        }
                        className="pr-14"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                        feet
                      </span>
                    </div>

                    <div className="relative w-1/2">
                      <Input
                        type="text"
                        value={state.in}
                        onChange={(e) =>
                          set(v => ({ ...v, in: sanitize(e.target.value) }))
                        }
                        className="pr-14"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                        inches
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <Input
                        type="text"

                      value={state.cm}
                      onChange={(e) =>
                        set(v => ({ ...v, cm: sanitize(e.target.value) }))
                      }
                      className="pr-14"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                      cm
                    </span>
                  </div>
                )}
              </div>
            ))}

            <Button className="w-full" onClick={goToResults}>
              See Recommended Lockers
            </Button>

          </CardContent>
        </Card>
      </div>
    </div>
  );
}
