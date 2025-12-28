"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

/* ---------------- helpers ---------------- */

function ftInToCm(ft: number, inch: number) {
  return ft * 30.48 + inch * 2.54;
}

function cmToFtIn(cm: number) {
  const totalInches = cm / 2.54;
  const ft = Math.floor(totalInches / 12);
  const inch = Math.round(totalInches % 12);
  return { ft, inch };
}

/** prevents 050 / 000 / junk input */
function normalize(value: string) {
  if (value === "") return "";
  const digits = value.replace(/\D/g, "");
  return digits.replace(/^0+/, "") || "";
}

/* ---------------- types ---------------- */

type Unit = "ftin" | "cm";

type Measure = {
  ft: string;
  in: string;
  cm: string;
};

/* ---------------- page ---------------- */

export default function LockerRecommenderPage() {
  const router = useRouter();
  const [unit, setUnit] = useState<Unit>("ftin");

  const [height, setHeight] = useState<Measure>({
    ft: "5",
    in: "10",
    cm: "178",
  });

  const [width, setWidth] = useState<Measure>({
    ft: "3",
    in: "0",
    cm: "50",
  });

  const [depth, setDepth] = useState<Measure>({
    ft: "2",
    in: "0",
    cm: "40",
  });

  /* ---------- unit switch ---------- */

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

    setHeight(v => ({ ...v, ft: String(h.ft), in: String(h.in) }));
    setWidth(v => ({ ...v, ft: String(w.ft), in: String(w.in) }));
    setDepth(v => ({ ...v, ft: String(d.ft), in: String(d.in) }));
    setUnit("ftin");
  }

  /* ---------- submit ---------- */

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

  /* ---------------- UI ---------------- */

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
              className="flex justify-center gap-2"
            >
              <ToggleGroupItem
                value="ftin"
                className="px-4 py-2 border
                  data-[state=on]:bg-emerald-600
                  data-[state=on]:text-white"
              >
                Feet / Inches
              </ToggleGroupItem>

              <ToggleGroupItem
                value="cm"
                className="px-4 py-2 border
                  data-[state=on]:bg-emerald-600
                  data-[state=on]:text-white"
              >
                CM
              </ToggleGroupItem>
            </ToggleGroup>

            {/* HEIGHT */}
            <div className="space-y-2">
              <Label>Height</Label>
              {unit === "ftin" ? (
                <div className="flex gap-2">
                  <Input
                    inputMode="numeric"
                    value={height.ft}
                    onChange={(e) =>
                      setHeight(h => ({ ...h, ft: normalize(e.target.value) }))
                    }
                    placeholder="feet"
                  />
                  <Input
                    inputMode="numeric"
                    value={height.in}
                    onChange={(e) =>
                      setHeight(h => ({ ...h, in: normalize(e.target.value) }))
                    }
                    placeholder="inches"
                  />
                </div>
              ) : (
                <Input
                  inputMode="numeric"
                  value={height.cm}
                  onChange={(e) =>
                    setHeight(h => ({ ...h, cm: normalize(e.target.value) }))
                  }
                  placeholder="cm"
                />
              )}
            </div>

            {/* WIDTH */}
            <div className="space-y-2">
              <Label>Width</Label>
              {unit === "ftin" ? (
                <div className="flex gap-2">
                  <Input
                    inputMode="numeric"
                    value={width.ft}
                    onChange={(e) =>
                      setWidth(w => ({ ...w, ft: normalize(e.target.value) }))
                    }
                    placeholder="feet"
                  />
                  <Input
                    inputMode="numeric"
                    value={width.in}
                    onChange={(e) =>
                      setWidth(w => ({ ...w, in: normalize(e.target.value) }))
                    }
                    placeholder="inches"
                  />
                </div>
              ) : (
                <Input
                  inputMode="numeric"
                  value={width.cm}
                  onChange={(e) =>
                    setWidth(w => ({ ...w, cm: normalize(e.target.value) }))
                  }
                  placeholder="cm"
                />
              )}
            </div>

            {/* DEPTH */}
            <div className="space-y-2">
              <Label>Depth</Label>
              {unit === "ftin" ? (
                <div className="flex gap-2">
                  <Input
                    inputMode="numeric"
                    value={depth.ft}
                    onChange={(e) =>
                      setDepth(d => ({ ...d, ft: normalize(e.target.value) }))
                    }
                    placeholder="feet"
                  />
                  <Input
                    inputMode="numeric"
                    value={depth.in}
                    onChange={(e) =>
                      setDepth(d => ({ ...d, in: normalize(e.target.value) }))
                    }
                    placeholder="inches"
                  />
                </div>
              ) : (
                <Input
                  inputMode="numeric"
                  value={depth.cm}
                  onChange={(e) =>
                    setDepth(d => ({ ...d, cm: normalize(e.target.value) }))
                  }
                  placeholder="cm"
                />
              )}
            </div>

            <Button className="w-full" onClick={goToResults}>
              See Recommended Lockers
            </Button>

          </CardContent>
        </Card>
      </div>
    </div>
  );
}
