/*
PLANNING-GRADE NEUTRON SOURCE MODEL
This module converts engineering-level GDT parameters
into effective neutron yield.
It does NOT simulate plasma physics or neutron transport.
*/

export function gdtNeutronSource(params) {
  const {
    fusionPower_MW,
    neutronsPerMW,
    dutyCycle,
    availability,
    wallLoading_MWm2,
    maxWallLoading_MWm2
  } = params;

  if (fusionPower_MW <= 0) throw new Error("fusionPower_MW must be > 0");
  if (dutyCycle < 0 || dutyCycle > 1) throw new Error("Invalid dutyCycle");
  if (availability < 0 || availability > 1) throw new Error("Invalid availability");

  const instantaneousYield = fusionPower_MW * neutronsPerMW;

  const timeAveragedYield =
    instantaneousYield * dutyCycle * availability;

  let wallDerate = 1.0;
  if (wallLoading_MWm2 > maxWallLoading_MWm2) {
    wallDerate = maxWallLoading_MWm2 / wallLoading_MWm2;
  }

  return {
    instantaneousYield,
    timeAveragedYield,
    wallDerate,
    effectiveYield: timeAveragedYield * wallDerate
  };
}

