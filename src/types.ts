export type Edition = 'standard' | 'founders' | 'b0rk';

export interface ShippingRequest {
  sku: Edition;
  country: string;
  postcode: string;
}

export interface ShippingOption {
  id: string;
  label: string;
  price: string;
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