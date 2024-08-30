import { config } from '../config'

export function toDogePlusHandling(postageCostInAUD: number): number {
  // Returns the cost of
  // <<postage AND handling>>
  // in <<Doge>>
  // rounded to the NEAREST number ending in <<69>>.

  const inDoge = postageCostInAUD / Number(config.dogeToAudRate);
  const inDogePlusHandling = inDoge + Number(config.handlingCost);
  const roundedValue = Math.round(inDogePlusHandling);

  // Calculate the lower and upper bounds
  const lowerBound = Math.floor(roundedValue / 100) * 100 + 69;
  const upperBound = Math.ceil(roundedValue / 100) * 100 + 69;

  // Choose the nearest bound
  const nearestEndingIn69 = (roundedValue - lowerBound < upperBound - roundedValue) ? lowerBound : upperBound;

  if (nearestEndingIn69 < 30) {
    throw new Error('Malfunction calculating shipping cost');
  }

  return nearestEndingIn69;
}