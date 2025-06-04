import { config } from '../config'

export function toDogePlusHandling(postageCostInAUD: number): number {
  console.log("postageCostInAUD", postageCostInAUD);
  // Returns the cost of postage and handling in Doge
  const inDoge = postageCostInAUD / Number(config.dogeToAudRate);
  var inDogePlusHandling = inDoge + Number(config.handlingCost);

  // Add doge factor (round to nearest number ending in .69)
  inDogePlusHandling = Math.floor(inDogePlusHandling) + (inDogePlusHandling % 1 < 0.69 ? 0.69 : 1.69);
    
  if (inDogePlusHandling < 30) {
    throw new Error('Malfunction calculating shipping cost');
  }

  return inDogePlusHandling;
}