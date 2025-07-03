import fs from "fs";
import path from "path";

interface Config {
  port: number;
  auspost: {
    baseURL: string;
  };
  dogeToAudRate: number;
  handlingCost: number;
  originPostcode: string;
  editions: {
    [key: string]: {
      price: number;
      name: string;
      dimensions: {
        length: number;
        width: number;
        height: number;
      };
      weight: number;
    };
  };
  fixedDomesticServices: {
    [key: string]: Array<{
      name: string;
      price: number;
    }>;
  };
  deliveryAdvice: {
    domestic: string;
    international: string;
  };
}

class ConfigManager {
  private static instance: ConfigManager;
  private config: Config;

  private constructor() {
    this.config = this.loadConfig();
  }

  public static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  private loadConfig(): Config {
    const env = process.env.CONFIG_ENV || "development";
    const configPath = path.join(
      __dirname,
      "../../config",
      `config.${env}.json`
    );

    if (!fs.existsSync(configPath)) {
      throw new Error(`Configuration file not found for environment: ${env}`);
    }

    const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    this.validateConfig(config);
    return config;
  }

  private validateConfig(config: Config): void {
    const requiredFields: (keyof Config)[] = [
      "port",
      "auspost",
      "dogeToAudRate",
      "handlingCost",
    ];

    for (const field of requiredFields) {
      if (config[field] === undefined) {
        throw new Error(`Missing required configuration field: ${field}`);
      }
    }

    // Validate auspost config
    if (!process.env.AUSPOST_API_KEY || !config.auspost.baseURL) {
      throw new Error("Missing required auspost configuration fields");
    }
  }

  public get(): Config {
    return this.config;
  }
}

export const config = ConfigManager.getInstance().get();
export type { Config };
