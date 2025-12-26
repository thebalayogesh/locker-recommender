import fs from "fs";
import path from "path";

const RAW_PATH = "./data/products.json";
const OUTPUT_BASE = "./data/products";

const rawProducts = JSON.parse(fs.readFileSync(RAW_PATH, "utf-8"));

const index = [];

function parsePrice(price) {
  if (typeof price === "number") return price;
  return Number(price.replace(/[^0-9]/g, ""));
}

function detectType(name) {
  const n = name.toLowerCase();

  if (n.includes("centiguard") || n.includes("safire")) return "fire-safe";
  if (n.includes("dream") || n.includes("myst") || n.includes("verge"))
    return "portable-safe";
  if (
    n.includes("nx pro") ||
    n.includes("ritz") ||
    n.includes("privy") ||
    n.includes("cashbox") ||
    n.includes("coffer")
  )
    return "compact-safe";

  return "locker";
}

function slugToId(slug) {
  return slug.replace(/[^a-z0-9]/gi, "-").toLowerCase();
}

rawProducts.forEach((p) => {
  const type = detectType(p.name);
  const id = slugToId(p.slug);
  const price = parsePrice(p.price);

  // ---- INDEX ENTRY ----
  index.push({
    id,
    type,
    name: p.name,
    slug: p.slug,
    price,
    image: p.images?.[0] ?? "",
    status: "active",
  });

  // ---- DETAIL FILE ----
  const detail = {
    id,
    type,
    brand: "Godrej",
    name: p.name,
    slug: p.slug,
    images: (p.images || []).map((img) => ({
      src: img,
      alt: p.name,
    })),
  };

  // Locker-only fields
  if (type === "locker" || type === "fire-safe") {
    detail.weight_kg = p.weight
      ? Number(p.weight.replace(/[^0-9.]/g, ""))
      : undefined;

    detail.volume_l = p.volume
      ? Number(p.volume.replace(/[^0-9.]/g, ""))
      : undefined;

    if (p.size?.[0]) {
      const m = p.size[0].match(
        /([\d.]+)\(h\)x([\d.]+)\(w\)x([\d.]+)\(d\)/
      );
      if (m) {
        detail.dimensions = {
          cm: {
            height: Number(m[1]),
            width: Number(m[2]),
            depth: Number(m[3]),
          },
        };
      }
    }
  }

  const outDir = path.join(OUTPUT_BASE, type);
  fs.mkdirSync(outDir, { recursive: true });

  fs.writeFileSync(
    path.join(outDir, `${id}.json`),
    JSON.stringify(detail, null, 2)
  );
});

// write index
fs.writeFileSync(
  path.join(OUTPUT_BASE, "products.index.json"),
  JSON.stringify(index, null, 2)
);

console.log("✅ Product migration completed successfully");
