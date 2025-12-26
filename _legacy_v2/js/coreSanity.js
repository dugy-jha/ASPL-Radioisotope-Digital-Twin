/*
PHYSICS CORE — LOCKED
Do not modify without full revalidation.
Any UI, routing, or scoring logic must treat this as read-only.
*/

export function coreSanityTest() {
  const lambda = Math.log(2) / (2.75 * 24 * 3600);
  const R = 1e10;
  const t = 3 * 24 * 3600;
  return R / lambda * (1 - Math.exp(-lambda * t));
}

