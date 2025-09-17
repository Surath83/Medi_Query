// config.js
// eslint-disable-next-line no-unused-vars
import Constants from "expo-constants";

const ENV = {
  dev: {
    API_BASE: process.env.API_BASE || "http://172.20.17.102:5000",
  },
  prod: {
    API_BASE: "https://your-production-domain.com", // fallback in prod
  },
};

const getEnvVars = () => {
  if (__DEV__) {
    return ENV.dev;
  }
  return ENV.prod;
};

export default getEnvVars();
