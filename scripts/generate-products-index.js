import fs from "fs";
import path from "path";

/**
 * CONFIG
 */
const LOCKER_DIR = "./data/products/locker";
const OUTPUT_FILE = "./data/products.index.json";

/**
 * HELPERS
 */
const toNumber = (v) =>
  typeof v === "number"
    ? v
    : Number(String(v).replace(/[^0-9.]/g, ""));

function getStartingPrice(variants) {
  if (!Array.isArray(variants) || variants.length === 0) {
    throw new Error("Product has no variants");
  }

  const prices = variants
    .map((v) => toNumber(v.price))
    .filter((n) => !Number.isNaN(n));

  if (prices.length === 0) {
    throw new Error("No valid prices found in variants");
  }

  return Math.min(...prices);
}

function parseSize(sizeArr = []) {
  const parse = (s) => {
    const m = s.match(/([\d.]+)\(h\)x([\d.]+)\(w\)x([\d.]+)\(d\)/i);
    if (!m) return null;
    return {
      height: toNumber(m[1]),
      width: toNumber(m[2]),
      depth: toNumber(m[3]),
    };
  };

  const cm = sizeArr.find((s) => s.includes("(cm)"));
  const mm = sizeArr.find((s) => s.includes("(mm)"));

  return {
    cm: cm ? parse(cm) : null,
    mm: mm ? parse(mm) : null,
  };
}

/**
 * MAIN
 */
if (!fs.existsSync(LOCKER_DIR)) {
  throw new Error(`Locker directory not found: ${LOCKER_DIR}`);
}

const files = fs
  .readdirSync(LOCKER_DIR)
  .filter((f) => f.endsWith(".json"));

const index = files.map((file) => {
  const fullPath = path.join(LOCKER_DIR, file);
  const raw = fs.readFileSync(fullPath, "utf-8");
  const product = JSON.parse(raw);

  return {
    id: product.id,
    type: product.type,
    name: product.name,
    slug: product.slug,
    starting_price: getStartingPrice(product.variants),
    dimensions: parseSize(product.size),
    image: product.images?.[0]?.src ?? "",
    tags: product.tags ?? [],
  };
});

// sort cheap → expensive
index.sort((a, b) => a.starting_price - b.starting_price);

// ensure output dir exists
fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });

// write index
fs.writeFileSync(OUTPUT_FILE, JSON.stringify(index, null, 2));

console.log(`✅ products.index.json generated (${index.length} items)`);
