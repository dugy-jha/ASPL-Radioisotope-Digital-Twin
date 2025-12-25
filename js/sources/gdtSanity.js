import { gdtNeutronSource } from './gdtSource.js';
import { DT_NEUTRONS_PER_MW } from './sourceConstants.js';

export function gdtSanityTest() {
  return gdtNeutronSource({
    fusionPower_MW: 10,
    neutronsPerMW: DT_NEUTRONS_PER_MW,
    dutyCycle: 0.5,
    availability: 0.7,
    wallLoading_MWm2: 2,
    maxWallLoading_MWm2: 4
  });
}

