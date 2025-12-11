'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import productsRaw from '@/data/products.json';
import ProductCard from '@/app/ProductCard';

// LockerRecommender integrated with your ProductCard
// - Uses ProductCard for product presentation (SEO-friendly, Next Image)
// - Keeps filters, sorting, admin debug, lightbox, full product URLs
// - Respects prefers-reduced-motion via framer-motion hook

const WA_LINK = 'https://wa.me/919999999999?text='; // replace with your number
const BASE_URL = 'https://homelockers.in/products/';

function parseCmSize(sizeArr) {
  if (!Array.isArray(sizeArr)) return null;
  const cm = sizeArr.find((s) => String(s).includes('(cm)'));
  if (!cm) return null;
  const cleaned = String(cm).replace('(cm)', '').replace(/\s/g, '');
  const m = cleaned.match(/([\d.]+)\(h\)x([\d.]+)\(w\)x([\d.]+)\(d\)/i);
  if (!m) return null;
  return {
    h: parseFloat(m[1]),
    w: parseFloat(m[2]),
    d: parseFloat(m[3]),
    volume_cm3: parseFloat(m[1]) * parseFloat(m[2]) * parseFloat(m[3]),
  };
}

function normalizeProducts(products) {
  return (products || [])
    .map((p) => {
      const dims = parseCmSize(p.size || []);
      const volumeL = p.volume
        ? parseFloat(String(p.volume).replace(/[^\d.]/g, ''))
        : dims
        ? +(dims.volume_cm3 / 1000).toFixed(2)
        : null;

      return {
        ...p,
        _dims: dims,
        _volumeL: volumeL !== null ? Number(volumeL) : null,
        _url: BASE_URL + (p.slug || p.id),
      };
    })
    .filter((p) => p._dims);
}

function recommend(productsNormalized, user, opts) {
  const { allowRotation = true } = opts;
  const userVol = user.h * user.w * user.d;

  const fits = productsNormalized.filter((p) => {
    const d = p._dims;
    const direct = d.h <= user.h && d.w <= user.w && d.d <= user.d;
    if (direct) return true;
    if (!allowRotation) return false;

    const rotations = [
      { h: d.w, w: d.h, d: d.d },
      { h: d.d, w: d.w, d: d.h },
      { h: d.h, w: d.d, d: d.w },
      { h: d.w, w: d.d, d: d.h },
      { h: d.d, w: d.h, d: d.w },
    ];
    return rotations.some((r) => r.h <= user.h && r.w <= user.w && r.d <= user.d);
  });

  return fits.map((p) => {
    const pVol = p._dims.h * p._dims.w * p._dims.d;
    const wastedCm3 = Math.max(0, userVol - pVol);
    const absVolDiff = Math.abs(pVol - userVol);

    return {
      ...p,
      score: absVolDiff,
      wastedCm3,
      priceNum: Number(String(p.price || '').replace(/[^0-9]/g, '')),
    };
  });
}

export default function LockerRecommenderWithCard({ defaultTop = 3 }) {
  const normalized = useMemo(() => normalizeProducts(productsRaw), []);

  const [h, setH] = useState(60);
  const [w, setW] = useState(50);
  const [d, setD] = useState(45);

  const [allowRotation, setAllowRotation] = useState(true);
  const [filterPrice, setFilterPrice] = useState('all');
  const [filterLock, setFilterLock] = useState('all');
  const [sortType, setSortType] = useState('fit');

  const [admin, setAdmin] = useState(false);
  const [lightbox, setLightbox] = useState(null);

  const reduceMotion = useReducedMotion();

  const results = useMemo(() => {
    const user = { h: Number(h), w: Number(w), d: Number(d) };
    if (isNaN(user.h) || isNaN(user.w) || isNaN(user.d)) return [];

    let recs = recommend(normalized, user, { allowRotation });

    // PRICE FILTER
    if (filterPrice !== 'all') {
      recs = recs.filter((r) => {
        const p = r.priceNum;
        if (!p) return false;
        if (filterPrice === 'low') return p < 30000;
        if (filterPrice === 'mid') return p >= 30000 && p <= 60000;
        if (filterPrice === 'high') return p > 60000;
      });
    }

    // LOCK TYPE FILTER
    if (filterLock !== 'all') {
      recs = recs.filter((r) =>
        (r.lock_mechanism || [])
          .join(' ')
          .toLowerCase()
          .includes(filterLock)
      );
    }

    // SORTING
    recs.sort((a, b) => {
      if (sortType === 'fit') return a.score - b.score;
      if (sortType === 'price-low') return (a.priceNum || 0) - (b.priceNum || 0);
      if (sortType === 'price-high') return (b.priceNum || 0) - (a.priceNum || 0);
      return 0;
    });

    // limit to defaultTop items for view but keep full list available for WhatsApp
    return recs.slice(0, defaultTop);
  }, [h, w, d, allowRotation, filterPrice, filterLock, sortType, normalized, defaultTop]);

  function toWhatsAppText(selected) {
    const models = selected
      .map((r) => `${r.name} (${r._dims.h}x${r._dims.w}x${r._dims.d} cm) → ${r._url}`)
      .join(', ');
    return encodeURIComponent(
      `Hi, I measured my space ${h}x${w}x${d} cm. Suggested lockers: ${models}`
    );
  }

  function handleNumber(setter) {
    return (e) => {
      const v = e.target.value;
      if (v === '') return setter('');
      const n = Number(v);
      if (!isNaN(n)) setter(n);
    };
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header + Controls */}
        <section className="bg-white dark:bg-gray-800 shadow rounded-xl p-4 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              {/* <h2 className="text-xl font-bold">Locker Finder</h2>
              <p className="text-sm text-gray-600 dark:text-gray-300">Mobile-friendly · Dark/light theme ready · Tap images to preview</p> */}
            </div>

            {/* <div className="flex items-center gap-2">
              <button onClick={() => setAdmin(!admin)} className="text-sm underline">{admin ? 'Hide debug' : 'Show debug'}</button>
            </div> */}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input type="number" placeholder="Height (cm)" value={h} onChange={handleNumber(setH)} className="p-3 rounded border dark:border-gray-700 bg-transparent" />
            <input type="number" placeholder="Width (cm)" value={w} onChange={handleNumber(setW)} className="p-3 rounded border dark:border-gray-700 bg-transparent" />
            <input type="number" placeholder="Depth (cm)" value={d} onChange={handleNumber(setD)} className="p-3 rounded border dark:border-gray-700 bg-transparent" />
          </div>

          <div className="flex flex-wrap gap-3 items-center">
            {/* <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={allowRotation} onChange={(e) => setAllowRotation(e.target.checked)} />
              Allow rotation
            </label> */}

            {/* <select value={filterPrice} onChange={(e) => setFilterPrice(e.target.value)} className="p-2 border rounded dark:border-gray-700">
              <option value="all">All prices</option>
              <option value="low">Below 30k</option>
              <option value="mid">30k–60k</option>
              <option value="high">Above 60k</option>
            </select> */}

            {/* <select value={filterLock} onChange={(e) => setFilterLock(e.target.value)} className="p-2 border rounded dark:border-gray-700">
              <option value="all">All locks</option>
              <option value="key">Key</option>
              <option value="digital">Digital</option>
              <option value="biometric">Biometric</option>
            </select> */}

            {/* <select value={sortType} onChange={(e) => setSortType(e.target.value)} className="p-2 border rounded dark:border-gray-700">
              <option value="fit">Best fit</option>
              <option value="price-low">Price: low → high</option>
              <option value="price-high">Price: high → low</option>
            </select> */}

            {/* <a href={`${WA_LINK}${toWhatsAppText(results)}`} target="_blank" rel="noreferrer" className="ml-auto bg-emerald-600 text-white px-3 py-2 rounded text-sm">Send WhatsApp</a> */}
          </div>
        </section>

        {/* Results */}
        <main className="mt-6">
          {results.length === 0 ? (
            <div className="rounded-2xl border-dashed border-2 border-gray-200 dark:border-gray-700 p-6 text-center">
              <p className="text-gray-600 dark:text-gray-300 mb-2">No models fit your space.</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Enable rotation or adjust dimensions slightly.</p>
            </div>
          ) : (
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence>
                {results.map((r) => (
                  <motion.li
                    key={r.id}
                    initial={reduceMotion ? {} : { opacity: 0, y: 12 }}
                    animate={reduceMotion ? {} : { opacity: 1, y: 0 }}
                    exit={reduceMotion ? {} : { opacity: 0, y: 12 }}
                    transition={{ duration: 0.24 }}
                    className="relative"
                  >
                    <ProductCard product={r} />

                    {/* action row below ProductCard */}
                    {/* <div className="mt-2 flex gap-2"> */}
                      {/* <a href={`${WA_LINK}${toWhatsAppText([r])}`} target="_blank" rel="noreferrer" className="flex-1 bg-emerald-600 text-white p-2 rounded text-sm text-center">Get Quote</a> */}
                      {/* <a href={r._url} target="_blank" rel="noreferrer" className="text-sm p-2 border rounded">View</a> */}
                    {/* </div> */}

                    {/* click-to-preview: ProductCard uses next/image; we add a small overlay button for lightbox */}
                    {/* {r.images && r.images.length > 0 && (
                      <button
                        aria-label={`Preview images for ${r.name}`}
                        onClick={() => setLightbox(r.images)}
                        className="absolute top-3 right-3 bg-black/40 text-white text-xs px-2 py-1 rounded"
                      >
                        Preview
                      </button>
                    )} */}
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          )}
        </main>

        {/* Lightbox (simple single-image preview) */}
        <AnimatePresence>
          {lightbox && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
              <motion.img initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} transition={{ duration: 0.18 }} src={lightbox[0]} alt="preview" className="max-w-full max-h-full rounded" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Admin debug */}
        {admin && (
          <details className="mt-6 bg-gray-50 dark:bg-gray-800 p-4 rounded">
            <summary className="cursor-pointer text-sm font-semibold">Debug Data</summary>
            <pre className="text-xs max-h-64 overflow-auto mt-2">{JSON.stringify(normalized, null, 2)}</pre>
          </details>
        )}
      </div>
    </div>
  );
}
