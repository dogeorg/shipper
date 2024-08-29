import { config } from '../config';

interface Country {
  code: string;
  name: string;
}

interface CountriesResponse {
  countries: {
    country: Country[];
  };
}

export async function getCountries(): Promise<Country[]> {
  const url = `${config.baseURL}/postage/country.json`;

  const response = await fetch(url, {
    headers: {
      'AUTH-KEY': config.apiKey
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json() as CountriesResponse;
  return data.countries.country;
}