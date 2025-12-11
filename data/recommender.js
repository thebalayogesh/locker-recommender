export function parseCmSize(sizeArr) {
  const cm = sizeArr.find((s) => s.includes('(cm)'));
  if (!cm) return null;

  const cleaned = cm.replace('(cm)', '').replace(/\s/g, '');
  const m = cleaned.match(/([\d.]+)\(h\)x([\d.]+)\(w\)x([\d.]+)\(d\)/i);
  if (!m) return null;

  return {
    h: parseFloat(m[1]),
    w: parseFloat(m[2]),
    d: parseFloat(m[3]),
    volume_cm3: parseFloat(m[1]) * parseFloat(m[2]) * parseFloat(m[3]),
  };
}

export function normalizeProducts(products) {
  return products
    .map((p) => {
      const dims = parseCmSize(p.size || []);
      const volumeL = p.volume
        ? parseFloat(String(p.volume).replace(/[^\d.]/g, ''))
        : dims
          ? (dims.volume_cm3 / 1000).toFixed(2)
          : null;

      return {
        ...p,
        _dims: dims,
        _volumeL: volumeL ? Number(volumeL) : null,
      };
    })
    .filter((p) => p._dims);
}

export function recommend(productsNormalized, user, topN = 3) {
  const userVol = user.h * user.w * user.d;

  const fits = productsNormalized.filter((p) => {
    const d = p._dims;
    return d.h <= user.h && d.w <= user.w && d.d <= user.d;
  });

  const scored = fits.map((p) => {
    const pVol = p._dims.h * p._dims.w * p._dims.d;
    const wastedCm3 = userVol - pVol;
    const absVolDiff = Math.abs(pVol - userVol);

    let score = absVolDiff;

    if (p.tags?.includes('featured')) score *= 0.85;

    const mech = (p.lock_mechanism || []).join(' ').toLowerCase();
    if (mech.includes('biometric')) score *= 0.9;

    const priceNum = Number(String(p.price || '').replace(/[^0-9]/g, ''));
    if (priceNum && priceNum < 40000) score *= 0.95;

    return { product: p, score, wastedCm3, priceNum };
  });

  scored.sort((a, b) => a.score - b.score || a.priceNum - b.priceNum);

  return scored.slice(0, topN).map((s) => ({
    id: s.product.id,
    name: s.product.name,
    price: s.product.price,
    dims: s.product._dims,
    volumeL: s.product._volumeL,
    images: s.product.images,
    score: Number(s.score.toFixed(2)),
    wastedCm3: Math.round(s.wastedCm3),
  }));
}

/**
 * Recommend function
 * @param {Array} productsNormalized - output of normalizeProducts

/* ------------------ usage example ------------------ */
// assume `products` is loaded JSON array (from your uploaded products.json)
// const products = require('./products.json'); // Node; in browser fetch it
// const normalized = normalizeProducts(products);

// Example user space: 60cm x 50cm x 45cm
// const userSpace = { h: 60, w: 50, d: 45 };
// const top = recommend(normalized, userSpace, 4);
// console.log(top);
