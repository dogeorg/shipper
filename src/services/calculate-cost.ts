import { config } from '../config';

interface AusPostService {
  code: string;
  name: string;
  price: number;
  max_extra_cover: number;
}

interface AusPostServiceResponse {
  services: {
    service: AusPostService[];
  };
}

// Parcel dimensions are fixed and not provided by the user. 
// They are set in config.
interface Parcel {
  length: number;
  width: number;
  height: number;
  weight: number;
}

export async function getInternationalServices(countryCode: string, weight: number, postcode: string = ''): Promise<AusPostService[]> {
  let url = `${config.baseURL}/postage/parcel/international/service.json?country_code=${countryCode}&weight=${weight}`;
  
  // Postcode is optional. When provided, tack it on.
  if (postcode) {
    url += `&destination_postcode=${postcode}`;
  }

  const response = await fetch(url, {
    headers: {
      'AUTH-KEY': config.apiKey
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json() as AusPostServiceResponse;
  const services = data.services.service.map((s) => {
    return {
      ...s,
      price: toDoge(s.price)
    }
  })
  return services;
}

function toDoge(postageCostInAUD: number): number {
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

export async function getDomesticServices(fromPostcode: string, toPostcode: string, parcel: Parcel): Promise<AusPostService[]> {
  const response = await fetch(`${config.baseURL}/postage/parcel/domestic/service.json?from_postcode=${fromPostcode}&to_postcode=${toPostcode}&length=${parcel.length}&width=${parcel.width}&height=${parcel.height}&weight=${parcel.weight}`, {
    headers: {
      'AUTH-KEY': config.apiKey
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json() as AusPostServiceResponse;
  return data.services.service;
}