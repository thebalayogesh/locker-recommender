import products from '@/data/products.json';
import { normalizeProducts, recommend } from '@/data/recommender';
import LockerRecommender from '@/app/LockerRecommender';

export default function Home() {
  const normalized = normalizeProducts(products);
  const userSpace = { h: 8.4, w: 34, d: 25.8 };
  const top = recommend(normalized, userSpace, 4);

  // (cm)8.4(h)x34(w)x25.8(d)

  return (
    <div>
      {/*<h1 className="text-3xl text-center">Hello</h1>*/}

      {/*<h2>Recommended:</h2>*/}
      {/*<pre>{JSON.stringify(top, null, 2)}</pre>*/}

      <LockerRecommender />
    </div>
  );
}
