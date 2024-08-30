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

function toDoge(n: number): number {
  // Where n is AUD
  const inDoge = n / Number(config.dogeToAudRate);
  const inDogePlusHandling = inDoge + Number(config.handlingCost);
  const roundedUp = Math.ceil(inDogePlusHandling);
  const nextEndingIn69 = Math.ceil(roundedUp / 100) * 100 + 69;

  if (nextEndingIn69 < 30) {
    throw new Error('Malfunction calcuting shipping cost')
  }

  return nextEndingIn69;
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