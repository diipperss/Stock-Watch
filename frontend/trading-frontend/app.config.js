import 'dotenv/config';

export default {
  expo: {
    name: "trading-frontend",
    slug: "trading-frontend",
    version: "1.0.0",
    orientation: "portrait",
    scheme: "tradingfrontend",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true
    },
    android: {
      adaptiveIcon: {
        backgroundColor: "#ffffff"
      },
      edgeToEdgeEnabled: true
    },
    web: {
      bundler: "metro",
      output: "static",
    },
    plugins: [
      "expo-router",
    ],
    experiments: {
      typedRoutes: true
    },
    extra: {
      apiKey: process.env.API_KEY,  // API key from .env
    }
  }
};
