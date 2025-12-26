/**
 * products: array from products.index.json
 * answers: user finder answers
 */
export function findLockers(products, answers) {
  let result = [...products];

  /* 1️⃣ LOCK MECHANISM FILTER */
  if (answers.lockPreference !== "any") {
    result = result.filter((p) =>
      p.lock_mechanism.includes(answers.lockPreference)
    );
  }

  /* 2️⃣ BUDGET BAND (soft filter) */
  const budgetRanges = {
    low: [0, 30000],
    mid: [30000, 80000],
    high: [80000, Infinity],
  };

  const [min, max] = budgetRanges[answers.budget];

  const budgetMatches = result.filter(
    (p) => p.price >= min && p.price <= max
  );

  // If budget filter kills too many, relax it
  if (budgetMatches.length >= 3) {
    result = budgetMatches;
  }

  /* 3️⃣ STORAGE TYPE → SIZE HEURISTIC (VERY IMPORTANT) */
  if (answers.storage === "gold") {
    result = result.filter(
      (p) => p.size_cm?.h >= 50 // avoid tiny lockers
    );
  }

  if (answers.storage === "documents") {
    result = result.filter(
      (p) => p.size_cm?.h >= 40 && p.size_cm?.w >= 35
    );
  }

  /* 4️⃣ SORTING (this matters more than filtering) */
  result.sort((a, b) => {
    // prefer mid-sized, popular lockers
    if (a.tags?.includes("featured")) return -1;
    if (b.tags?.includes("featured")) return 1;
    return a.price - b.price;
  });

  /* 5️⃣ FINAL SHORTLIST */
  return result.slice(0, 5);
}
