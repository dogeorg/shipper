import { Router, Request, Response } from "express";
import {
  ShippingRequest,
  ShippingRequestSchema,
  ErrorResponse,
  SuccessResponse,
  ShippingOption,
} from "../types";
import { config } from "../config/index";
import { getInternationalServices } from "../services/calculate-cost";
import { getCountries } from "../services/countries";
import { toDogePlusHandling } from "../lib/convert";
import { fromZodError } from "zod-validation-error";

const router = Router();

function isValidCountry(country: string): boolean {
  return /^[A-Z]{2}$/.test(country);
}

function normalizePostcode(postcode: string | undefined): string | undefined {
  if (typeof postcode === "string") {
    const trimmedPostcode = postcode.trim();
    return trimmedPostcode !== "" ? trimmedPostcode : undefined;
  }
  return undefined;
}

async function handleShippingCalc(req: Request, res: Response): Promise<void> {
  try {
    const result = ShippingRequestSchema.safeParse(req.body);

    if (!result.success) {
      const errorResponse: ErrorResponse = {
        success: false,
        error: "BAD_INPUT",
        reasons: fromZodError(result.error).message.split("\n"),
      };
      res.status(400).json(errorResponse);
      return;
    }

    const { sku, country, postcode } = result.data;

    const selectedEdition = config.editions[sku];
    const parcel = {
      ...selectedEdition.dimensions,
      weight: selectedEdition.weight,
    };

    let services: any[];
    let serviceType: "domestic" | "international";

    if (country.toUpperCase() === "AU") {
      serviceType = "domestic";

      services = config.fixedDomesticServices[sku].map(
        (s: { name: string; price: number }) => {
          return {
            ...s,
            price: toDogePlusHandling(s.price),
          };
        }
      );
    } else {
      serviceType = "international";
      services = await getInternationalServices(
        country,
        parcel.weight,
        postcode
      );
    }

    if (!services || services.length === 0) {
      const noServicesResponse: SuccessResponse = {
        success: true,
        options: [],
        deliveryAdviceURL: config.deliveryAdvice[serviceType],
      };
      res.status(200).json(noServicesResponse);
      return;
    }

    const options: ShippingOption[] = services.map((s) => ({
      id: s.code || s.name,
      label: s.name,
      price_shipping_and_handling_only: s.price.toString(),
      price_product_only: config.editions[sku].price.toFixed(),
      price_combined_total: (config.editions[sku].price + s.price).toString(),
      currency: "DOGE",
    }));

    const successResponse: SuccessResponse = {
      success: true,
      options,
      deliveryAdviceURL: config.deliveryAdvice[serviceType],
    };

    res.json(successResponse);
  } catch (error) {
    console.error("Error:", error);
    const errorResponse: ErrorResponse = {
      success: false,
      error: "SERVER_ERROR",
      reasons: ["An unexpected error occurred"],
    };
    res.status(500).json(errorResponse);
  }
}

async function handleGetCountries(req: Request, res: Response): Promise<void> {
  try {
    // Get available international destinations from AusPOST
    const countries = await getCountries();

    // Format
    const c = countries.map((country) => ({
      code: country.code,
      name: country.name,
    }));

    // Add Australia
    c.push({
      code: "AU",
      name: "AUSTRALIA",
    });

    // Sort by country name
    c.sort((a, b) => a.name.localeCompare(b.name));

    const successResponse = {
      success: true,
      countries: c,
    };

    res.json(successResponse);
  } catch (error) {
    console.error("Error:", error);
    const errorResponse: ErrorResponse = {
      success: false,
      error: "SERVER_ERROR",
      reasons: ["An unexpected error occurred while fetching countries"],
    };
    res.status(500).json(errorResponse);
  }
}

router.post("/calc", handleShippingCalc);
router.get("/countries", handleGetCountries);

export default router;
