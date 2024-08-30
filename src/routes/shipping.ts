import { Router, Request, Response } from 'express';
import { ShippingRequest, ErrorResponse, SuccessResponse, ShippingOption } from '../types';
import { editions, deliveryAdvice, fixedDomesticServices } from '../config';
import { getInternationalServices } from '../services/calculate-cost';
import { getCountries } from '../services/countries';

const router = Router();

function isValidSku(sku: string): boolean {
  const validSkus = Object.keys(editions);
  return validSkus.includes(sku);
}

function isValidCountry(country: string): boolean {
  return /^[A-Z]{2}$/.test(country);
}

function normalizePostcode(postcode: string | undefined): string | undefined {
  if (typeof postcode === 'string') {
    const trimmedPostcode = postcode.trim();
    return trimmedPostcode !== '' ? trimmedPostcode : undefined;
  }
  return undefined;
}

async function handleShippingCalc(req: Request, res: Response): Promise<void> {
  const { sku, country, postcode: rawPostcode }: ShippingRequest = req.body;

  const postcode = normalizePostcode(rawPostcode);

  // Input validation
  const errors: string[] = [];
  if (!isValidSku(sku)) {
    errors.push(`Invalid SKU. Received "${sku}", expected one of ${Object.keys(editions).join(', ')}`);
  }

  if (!isValidCountry(country)) {
    errors.push(`Malformed country code. Received "${country}", expected 2 letter A-Z`);
  }

  if (errors.length > 0) {
    const errorResponse: ErrorResponse = {
      success: false,
      error: 'BAD_INPUT',
      reasons: errors
    };
    res.status(400).json(errorResponse);
    return;
  }

  try {
    const selectedEdition = editions[sku];
    const parcel = { ...selectedEdition.dimensions, weight: selectedEdition.weight };

    let services: any[];
    let serviceType: 'domestic' | 'international';

    if (country.toUpperCase() === 'AU') {
      serviceType = 'domestic';
      services = fixedDomesticServices[sku];
    } else {
      serviceType = 'international';
      services = await getInternationalServices(country, parcel.weight, postcode);
    }

    if (!services || services.length === 0) {
      const noServicesResponse: SuccessResponse = {
        success: true,
        options: [],
        deliveryAdviceURL: deliveryAdvice[serviceType]
      };
      res.status(200).json(noServicesResponse);
      return;
    }

    const options: ShippingOption[] = services.map(s => ({
      id: s.code || s.name,
      label: s.name,
      price: s.price.toString(),
      currency: 'doge'
    }));

    const successResponse: SuccessResponse = {
      success: true,
      options,
      deliveryAdviceURL: deliveryAdvice[serviceType]
    };

    res.json(successResponse);
  } catch (error) {
    console.error('Error:', error);
    const errorResponse: ErrorResponse = {
      success: false,
      error: 'SERVER_ERROR',
      reasons: ['An unexpected error occurred']
    };
    res.status(500).json(errorResponse);
  }
}

async function handleGetCountries(req: Request, res: Response): Promise<void> {
  try {
    // Get available international destinations from AusPOST
    const countries = await getCountries();

    // Format
    const c = countries.map(country => ({
      code: country.code,
      name: country.name
    }))

    // Add Australia
    c.push({
      code: "AU",
      name: "AUSTRALIA"
    });

    // Sort by country name
    c.sort((a, b) => a.name.localeCompare(b.name));

    const successResponse = {
      success: true,
      countries: c
    };

    res.json(successResponse);
  } catch (error) {
    console.error('Error:', error);
    const errorResponse: ErrorResponse = {
      success: false,
      error: 'SERVER_ERROR',
      reasons: ['An unexpected error occurred while fetching countries']
    };
    res.status(500).json(errorResponse);
  }
}

router.post('/calc', handleShippingCalc);
router.get('/countries', handleGetCountries);

export default router;