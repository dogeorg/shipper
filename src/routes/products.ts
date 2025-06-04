import { Router, Request, Response } from "express";
import { config } from "../config/index";

const router = Router();

interface Edition {
  sku: string;
  name: string;
  price: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  weight: number;
}

interface ProductsResponse {
  success: true;
  editions: Edition[];
}

interface ErrorResponse {
  success: false;
  error: string;
  reasons: string[];
}

async function handleGetProducts(req: Request, res: Response): Promise<void> {
  try {
    const editions = Object.entries(config.editions).map(([sku, edition]) => ({
      sku,
      ...edition,
    }));

    const response: ProductsResponse = {
      success: true,
      editions,
    };

    res.json(response);
  } catch (error) {
    console.error("Error:", error);
    const errorResponse: ErrorResponse = {
      success: false,
      error: "SERVER_ERROR",
      reasons: ["An unexpected error occurred while fetching products"],
    };
    res.status(500).json(errorResponse);
  }
}

router.get("/", handleGetProducts);

export default router;
