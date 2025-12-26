import fs from "fs";
import path from "path";

const RAW_FILE = "./data/products.json";
const OUTPUT_DIR = "./data/products/locker";

// --- helpers ---
const toNumber = (v) =>
  typeof v === "number"
    ? v
    : Number(String(v).replace(/[^0-9.]/g, ""));

function parseSize(sizeArr = []) {
  const cm = sizeArr.find((s) => s.includes("(cm)"));
  const mm = sizeArr.find((s) => s.includes("(mm)"));

  const parse = (s) => {
    const m = s.match(/([\d.]+)\(h\)x([\d.]+)\(w\)x([\d.]+)\(d\)/i);
    if (!m) return null;
    return {
      height: toNumber(m[1]),
      width: toNumber(m[2]),
      depth: toNumber(m[3]),
    };
  };

  return {
    cm: cm ? parse(cm) : null,
    mm: mm ? parse(mm) : null,
  };
}

function detectVariant(slug) {
  if (slug.includes("digi-bio"))
    return { id: "digi-bio", name: "Digital + Biometric", lock: "digital" };
  if (slug.includes("digi"))
    return { id: "digi-kl", name: "Digital + Key Lock", lock: "digital" };
  return { id: "kl", name: "Key Lock", lock: "key" };
}

function detectSmartFeatures(lock) {
  if (lock === "digital")
    return [
      "Low battery indicator",
      "Auto freeze on wrong attempts",
      "Master password",
      "Audio-visual alerts",
    ];
  return [];
}

// --- main ---
const raw = JSON.parse(fs.readFileSync(RAW_FILE, "utf-8"));

// group by base product (remove variant suffix)
const groups = {};

raw.forEach((p) => {
  const baseSlug = p.slug
    .replace("-digi-kl", "")
    .replace("-digi-bio", "")
    .replace("-kl", "");

  if (!groups[baseSlug]) {
    groups[baseSlug] = {
      id: baseSlug,
      type: "locker",
      brand: "Godrej",
      name: p.name.replace(/\(.*?\)/g, "").trim(),
      slug: baseSlug,
      dimensions: parseSize(p.size),
      weight_kg: toNumber(p.weight),
      volume_l: toNumber(p.volume),
      construction: {
        door_thickness_mm: 66,
        wall_thickness_mm: 3,
        shooting_bolts: "4-way",
        anchor_bolts: true,
      },
      smart_features: [],
      variants: [],
      tags: [],
      images: [],
      description: p.description || "",
    };
  }

  const variant = detectVariant(p.slug);

  groups[baseSlug].variants.push({
    id: variant.id,
    name: variant.name,
    lock_type: variant.lock,
    price: toNumber(p.price),
    features: detectSmartFeatures(variant.lock),
  });

  if (variant.lock === "digital") {
    groups[baseSlug].smart_features =
      detectSmartFeatures("digital");
  }

  p.images.forEach((img) => {
    groups[baseSlug].images.push({
      src: img,
      alt: groups[baseSlug].name,
    });
  });
});

// write files
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

Object.values(groups).forEach((product) => {
  const filePath = path.join(
    OUTPUT_DIR,
    `${product.slug}.json`
  );
  fs.writeFileSync(
    filePath,
    JSON.stringify(product, null, 2)
  );
});

console.log(
  `✅ Migrated ${Object.keys(groups).length} lockers successfully`
);
