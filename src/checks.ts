import { config } from './config';

export async function canReachService(): Promise<Boolean> {
  let url = `${config.baseURL}/postage/parcel/international/service.json?country_code=PT&weight=1`;
  let response;
  
  try {
    response = await fetch(url, {
      headers: {
        'AUTH-KEY': config.apiKey
      }
    });
  } catch (err) {
    console.error(err);
    return false;
  }

  return response.ok
}