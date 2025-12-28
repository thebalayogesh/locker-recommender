import { RawProduct } from "@/types/product";
import { Product, ProductTag } from "@/types/product";

const ALLOWED_TAGS: ProductTag[] = [
  "best-fit",
  "also-fits",
  "recommended",
  "best-seller",
];

export function normalizeProducts(raw: RawProduct[]): Product[] {
  return raw.map((p) => ({
    ...p,
    tags: p.tags?.filter(
      (t): t is ProductTag => ALLOWED_TAGS.includes(t as ProductTag)
    ),
  }));
}
