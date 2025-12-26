import Image from "next/image";

interface Product {
    name: string;
    image: string;
    size_cm: string;
    weight: string;
    volume: string;

}

export default function ProductCard({ product }:Product) {
  return (
    <div className="border rounded-lg p-4 bg-white">
      <div className="relative w-full h-40 mb-3">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-contain"
          sizes="(max-width: 768px) 100vw, 300px"
        />
      </div>

      <h3 className="font-semibold">{product.name}</h3>
      <p className="text-sm text-gray-600">
        Size: {product.size_cm}
      </p>
      <p className="text-sm text-gray-600">
        Weight: {product.weight}
      </p>
      <p className="text-sm text-gray-600">
        Volume: {product.volume}
      </p>

      <p className="mt-2 text-lg font-bold text-emerald-700">
        ₹ {product.price}
      </p>
    </div>
  );
}
