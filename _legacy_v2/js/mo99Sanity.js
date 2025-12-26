/*
PHYSICS CORE — LOCKED
Do not modify without full revalidation.
Any UI, routing, or scoring logic must treat this as read-only.
*/

export function mo99Sanity() {
  const parentHalfLife = 2.75 * 24 * 3600;
  const daughterHalfLife = 0.25 * 24 * 3600;

  const lambdaP = Math.log(2) / parentHalfLife;
  const lambdaD = Math.log(2) / daughterHalfLife;

  // Use modelSelfTest to get Np
  const Np = (() => {
    const lambda = Math.log(2) / (1 * 24 * 3600);
    const R = 1e9;
    const t = 1 * 24 * 3600;
    const f = 1 - Math.exp(-lambda * t);
    return R * f / lambda;
  })();

  const t = 1 * 24 * 3600;

  const Nd =
    Np *
    (lambdaP / (lambdaD - lambdaP)) *
    (Math.exp(-lambdaP * t) - Math.exp(-lambdaD * t));

  return { Np, Nd };
}

