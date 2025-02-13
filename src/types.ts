import { z } from "zod";
import { config } from "./config/index";

const validSkus = Object.keys(config.editions) as [string, ...string[]];

export const ShippingRequestSchema = z.object({
  sku: z.enum(validSkus),
  country: z.string().length(2).toUpperCase(),
  postcode: z.string().optional(),
});

export type ShippingRequest = z.infer<typeof ShippingRequestSchema>;

export interface ShippingOption {
  id: string;
  label: string;
  price_shipping_and_handling_only: string;
  price_product_only: string;
  price_combined_total: string;
  currency: string;
}

export interface SuccessResponse {
  success: true;
  options: ShippingOption[];
  deliveryAdviceURL: string;
}

export interface ErrorResponse {
  success: false;
  error: string;
  reasons: string[];
}

export type ApiResponse = SuccessResponse | ErrorResponse;
