declare namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: "development" | "production" | "test";
      MARKET_DATA_PROVIDER: 'alpaca' | 'tiingo' | 'polygon' | '' | undefined
      ALPACA_API_KEY_ID: string;
      ALPACA_API_SECRET_KEY: string;
      TIINGO_API_KEY: string;
      POLYGON_API_KEY: string;
    }
  }