import { config } from '../config';
import { toDogePlusHandling } from '../lib/convert';

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
      price: toDogePlusHandling(s.price)
    }
  })
  return services;
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