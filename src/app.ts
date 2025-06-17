import express from "express";
import cors from "cors";
import shippingRoutes from "./routes/shipping";
import productsRoutes from "./routes/products";
import { canReachService } from "./checks";
import { config } from "./config/index";

async function startServer() {
  try {
    // Check for AusPost API key
    if (!process.env.AUSPOST_API_KEY) {
      console.error("Error: AusPost API key is not configured");
      process.exit(1);
    }

    if (!config.dogeToAudRate) {
      console.error("Error: DOGE to AUD rate is not configured");
      process.exit(1);
    }

    if (!config.handlingCost) {
      console.error("Error: Handling cost in DOGE is not configured");
      process.exit(1);
    }

    if (!config.originPostcode) {
      console.error("Error: Origin postcode is not configured");
      process.exit(1);
    }

    // Check AusPost is reachable
    if (await canReachService()) {
      console.log(
        "[✓] Startup check passed: AusPOST shipping calculation API is reachable"
      );
    } else {
      console.error("Startup check failed. Test request to AusPOST failed");
      process.exit(1);
    }

    // CORS configuration
    const corsOptions: cors.CorsOptions = {
      origin: (origin, callback) => {
        if (!origin) {
          return callback(null, true);
        }
        const hostname = new URL(origin).hostname;
        if (hostname === "localhost") {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      },
      methods: ["GET", "POST"],
      allowedHeaders: ["Content-Type"],
    };

    const app = express();
    app.use(cors(corsOptions));
    app.use(express.json());
    app.use("/shipping", shippingRoutes);
    app.use("/products", productsRoutes);

    app.listen(config.port, () => {
      console.log(`[✓] Server is running on port ${config.port}`);
    });
  } catch (error) {
    console.error("Error during startup:", error);
    process.exit(1);
  }
}

startServer();
