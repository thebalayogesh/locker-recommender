// scripts/migrate-sizes.js
// Run once: node scripts/migrate-sizes.js

const fs = require("fs");
const path = require("path");

const INPUT_PATH = path.join(__dirname, "../data/raw/products.json");
const OUTPUT_PATH = path.join(__dirname, "../data/raw/products.migrated.json");

// Regex helpers
function parseSize(str) {
  // Example: (cm)90.3(h)x53.6(w)x54.7(d)
  const match = str.match(
    /\((cm|mm)\)([\d.]+)\(h\)x([\d.]+)\(w\)x([\d.]+)\(d\)/i
  );
  if (!match) return null;

  return {
    unit: match[1],
    height: Number(match[2]),
    width: Number(match[3]),
    depth: Number(match[4]),
  };
}

const raw = fs.readFileSync(INPUT_PATH, "utf-8");
const products = JSON.parse(raw);

const migrated = products.map((product) => {
  if (!Array.isArray(product.size)) {
    return product;
  }

  let cm = null;
  let mm = null;

  for (const s of product.size) {
    const parsed = parseSize(s);
    if (!parsed) continue;

    if (parsed.unit === "cm") {
      cm = {
        height: parsed.height,
        width: parsed.width,
        depth: parsed.depth,
      };
    }

    if (parsed.unit === "mm") {
      mm = {
        height: parsed.height,
        width: parsed.width,
        depth: parsed.depth,
      };
    }
  }

  return {
    ...product,
    dimensions: {
      ...(cm ? { cm } : {}),
      ...(mm ? { mm } : {}),
    },
  };
});

fs.writeFileSync(
  OUTPUT_PATH,
  JSON.stringify(migrated, null, 2),
  "utf-8"
);

console.log("✅ Migration complete.");
console.log("➡ Output:", OUTPUT_PATH);
