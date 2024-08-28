import { Router } from 'express';
import { ShippingRequest, ErrorResponse, SuccessResponse, ShippingOption } from '../types';
import { editions, deliveryAdvice, fixedDomesticServices } from '../config';
import { getInternationalServices } from '../services/shipping';

const router = Router();

router.post('/calc', async (req, res) => {
  const { sku, country, postcode: rawPostcode }: ShippingRequest = req.body;

  // Normalize postcode: if it's empty or just whitespace, treat it as undefined
  const postcode = typeof rawPostcode === 'string' && rawPostcode.trim() !== '' ? rawPostcode.trim() : undefined;

  const validSkus = Object.keys(editions);

  // Input validation
  const errors: string[] = [];
  if (!validSkus.includes(sku)) {
    errors.push(`Invalid SKU. Received "${sku}", expected one of ${validSkus.join(', ')}`);
  }

  // Expect a two letter country code, A-Z.
  if (!/^[A-Z]{2}$/.test(country)) {
    errors.push(`Malformed country code. Received "${country}", expected 2 letter A-Z`);
  }

  if (errors.length > 0) {
    const errorResponse: ErrorResponse = {
      success: false,
      error: 'BAD_INPUT',
      reasons: errors
    };
    return res.status(400).json(errorResponse);
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
      const errorResponse: ErrorResponse = {
        success: false,
        error: 'NO_SERVICES_AVAILABLE',
        reasons: [`No postage options available for the provided country (${country})${postcode ? ` and postcode (${postcode})` : ''}`]
      };
      return res.status(404).json(errorResponse);
    }

    const options: ShippingOption[] = services.map(s => ({
      id: s.code || s.name,
      label: s.name,
      price: s.price.toString()
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
});

export default router;