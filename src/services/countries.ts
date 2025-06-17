import { config } from "../config/index";

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
  const url = `${config.auspost.baseURL}/postage/country.json`;

  const response = await fetch(url, {
    headers: {
      "AUTH-KEY": process.env.AUSPOST_API_KEY!,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = (await response.json()) as CountriesResponse;
  return data.countries.country;
}
