export const config = {
  apiKey: process.env.AUSPOST_API_KEY || '',
  baseURL: 'https://digitalapi.auspost.com.au',
  dogeToAudRate: process.env.DOGE_TO_AUD || 0.15,
  handlingCost: process.env.HANDLING_COST_IN_DOGE || 30,
};

export const editions = {
  standard: { name: "Standard Edition", dimensions: { length: 15, width: 15, height: 15 }, weight: 0.7 },
  founders: { name: "Founders Edition", dimensions: { length: 20, width: 20, height: 20 }, weight: 1 },
  b0rk: { name: "Full B0rk Edition", dimensions: { length: 25, width: 25, height: 25 }, weight: 1.2 }
};

export const fixedDomesticServices = {
  standard: [
    { name: "Regular", price: 14.95 },
    { name: "Express", price: 18.95 }
  ],
  founders: [
    { name: "Regular", price: 16.95 },
    { name: "Express", price: 20.95 }
  ],
  b0rk: [
    { name: "Regular", price: 19.95 },
    { name: "Express", price: 24.95 }
  ]
};

export const deliveryAdvice = {
  domestic: "https://auspost.com.au/business/shipping/delivery-speeds-and-coverage",
  international: "https://auspost.com.au/sending/delivery-speeds-and-coverage/international-delivery-times"
};
