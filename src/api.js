const BASE = "https://www.themealdb.com/api/json/v1/1";

async function get(url, { signal } = {}) {
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return data.meals || [];
}

export function searchByIngredient(q, opts = {}) {
  return get(`${BASE}/filter.php?i=${encodeURIComponent(q.trim())}`, opts);
}

export function searchByName(q, opts = {}) {
  return get(`${BASE}/search.php?s=${encodeURIComponent(q.trim())}`, opts);
}

export async function lookupById(id, opts = {}) {
  const list = await get(`${BASE}/lookup.php?i=${id}`, opts);
  return list[0] || null;
}
