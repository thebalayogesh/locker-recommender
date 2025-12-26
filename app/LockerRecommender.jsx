'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import productsRaw from '@/data/products.json';
import ProductCard from '@/app/ProductCard';

const BASE_URL = 'https://homelockers.in/products/';

function parseCmSize(sizeArr) {
  if (!Array.isArray(sizeArr)) return null;
  const cm = sizeArr.find((s) => String(s).includes('(cm)'));
  if (!cm) return null;

  const cleaned = String(cm).replace('(cm)', '').replace(/\s/g, '');
  const m = cleaned.match(/([\d.]+)\(h\)x([\d.]+)\(w\)x([\d.]+)\(d\)/i);
  if (!m) return null;

  return {
    h: +m[1],
    w: +m[2],
    d: +m[3],
    volume_cm3: +m[1] * +m[2] * +m[3],
  };
}

function normalizeProducts(products) {
  return products
    .map((p) => {
      const dims = parseCmSize(p.size || []);
      if (!dims) return null;

      return {
        ...p,
        _dims: dims,
        _url: BASE_URL + (p.slug || p.id),
      };
    })
    .filter(Boolean);
}

function recommend(products, user) {
  const userVol = user.h * user.w * user.d;

  return products
    .filter((p) => {
      const d = p._dims;
      const rotations = [
        [d.h, d.w, d.d],
        [d.w, d.h, d.d],
        [d.d, d.w, d.h],
        [d.h, d.d, d.w],
        [d.w, d.d, d.h],
        [d.d, d.h, d.w],
      ];

      return rotations.some(
        ([h, w, d]) => h <= user.h && w <= user.w && d <= user.d
      );
    })
    .map((p) => {
      const vol = p._dims.h * p._dims.w * p._dims.d;
      return { ...p, score: Math.abs(vol - userVol) };
    })
    .sort((a, b) => a.score - b.score);
}

export default function LockerRecommenderWithCard({ defaultTop = 3 }) {
  const products = useMemo(() => normalizeProducts(productsRaw), []);

  const [h, setH] = useState(60);
  const [w, setW] = useState(50);
  const [d, setD] = useState(45);

  const results = useMemo(() => {
    return recommend(products, { h, w, d }).slice(0, defaultTop);
  }, [h, w, d, products, defaultTop]);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <section className="bg-white shadow rounded-xl p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <label className='text-black text-center' >Height</label>
            <input type="number" value={h} onChange={(e) => setH(+e.target.value)} placeholder="Height (cm)" className="p-3 border rounded" />
            <label>Width</label>
            <input type="number" value={w} onChange={(e) => setW(+e.target.value)} placeholder="Width (cm)" className="p-3 border rounded" />
            <label>Depth</label>
            <input type="number" value={d} onChange={(e) => setD(+e.target.value)} placeholder="Depth (cm)" className="p-3 border rounded" />
          </div>
        </section>

        <main className="mt-6">
          {results.length === 0 ? (
            <p className="text-center text-gray-600">No lockers fit this space.</p>
          ) : (
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence>
                {results.map((r) => (
                  <motion.li
                    key={r.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                  >
                    <ProductCard product={r} />
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          )}
        </main>
        
      </div>
      
    </div>
  );
}
