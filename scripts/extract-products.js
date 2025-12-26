import fs from "fs";
import path from "path";

/* CONFIG */
const INPUT_FILE = "./data/raw/products.json";
const OUTPUT_DIR = "./data/processed";

const NORMALIZED_FILE = path.join(OUTPUT_DIR, "products.normalized.json");
const INDEX_FILE = path.join(OUTPUT_DIR, "products.index.json");

/* HELPERS */
const toNumber = (v) =>
  typeof v === "number"
    ? v
    : Number(String(v).replace(/[^0-9.]/g, ""));

function parseSize(sizeArr = []) {
  const parse = (s) => {
    const m = s.match(/([\d.]+)\(h\)x([\d.]+)\(w\)x([\d.]+)\(d\)/i);
    if (!m) return null;
    return {
      h: toNumber(m[1]),
      w: toNumber(m[2]),
      d: toNumber(m[3]),
    };
  };

  const cm = sizeArr.find((s) => s.includes("(cm)"));
  const mm = sizeArr.find((s) => s.includes("(mm)"));

  return {
    cm: cm ? parse(cm) : null,
    mm: mm ? parse(mm) : null,
  };
}

/* MAIN */
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const raw = JSON.parse(fs.readFileSync(INPUT_FILE, "utf-8"));

/* 1️⃣ NORMALIZED PRODUCTS */
const normalized = raw.map((p) => {
  return {
    id: p.id,
    brand: p.name?.startsWith("Godrej") ? "Godrej" : "Other",
    type: "locker",
    name: p.name,
    slug: p.slug,

    price: {
      display: p.price,
      numeric: toNumber(p.price),
    },

    size: parseSize(p.size),

    weight_kg: toNumber(p.weight),
    volume_l: toNumber(p.volume),

    category: p.category ?? [],
    lock_mechanism: p.lock_mechanism ?? [],
    tags: p.tags ?? [],
    images: p.images ?? [],
    description: p.description ?? "",

    // light-touch suggestions (sales will finalize)
    usage_suggestions: [
      "home",
      "office",
      "documents",
      "gold",
      "cash",
    ],
  };
});

fs.writeFileSync(
  NORMALIZED_FILE,
  JSON.stringify(normalized, null, 2)
);

/* 2️⃣ INDEX FOR FINDER / LISTING */
const index = normalized
  .map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: p.price.numeric,
    size_cm: p.size.cm,
    category: p.category,
    lock_mechanism: p.lock_mechanism,
    image: p.images?.[0] ?? "",
    tags: p.tags,
  }))
  .sort((a, b) => a.price - b.price);

fs.writeFileSync(
  INDEX_FILE,
  JSON.stringify(index, null, 2)
);

console.log("✅ Products extracted");
console.log(`→ ${NORMALIZED_FILE}`);
console.log(`→ ${INDEX_FILE}`);
