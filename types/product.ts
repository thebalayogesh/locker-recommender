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


export type CmDimensions = {
  height: number;
  width: number;
  depth: number;
};

export type ProductDimensions = {
  cm: CmDimensions;
};

export type ProductTag =
  | "best-fit"
  | "also-fits"
  | "recommended"
  | "best-seller";


  export type RecommendedProduct = Product & {
  _fitScore: number;
  _lockerVol: number;
};


// types/raw-product.ts
export type RawProduct = {
  id: string;
  name: string;
  slug: string;
  category: string[];
  price?: string;
  weight?: string;
  volume?: string;
  images: string[];
  description?: string;
  lock_mechanism?: string[];
  tags?: string[];
  dimensions: {
    cm: {
      height: number;
      width: number;
      depth: number;
    };
  };
};


export type Product = {
  id: string;
  name: string;
  slug: string;

  category: string[];          // e.g. ["250x"]
  price?: string;

  weight?: string;
  volume?: string;

  images: string[];

  description?: string;

  lock_mechanism?: string[];

  dimensions: ProductDimensions;

  tags?: ProductTag[];
};
