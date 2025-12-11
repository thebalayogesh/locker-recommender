export interface ProductType {
  id: string;
  name: string;
  price: string; // Keep as string since you’re storing "1,40,899" with commas
  size?: string[];
  weight?: string;
  volume?: string;
  category: string[]; // e.g., ["250x"]
  slug: string;
  description?: string;
  images: string[];
  tags?: string[]; // e.g., ["best-seller", "featured"]
  lock_mechanism?: string[]; // e.g., ["digital", "keylock"]
}
