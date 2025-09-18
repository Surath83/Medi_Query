// config.js
// Handles API_BASE for dev (LAN IP) and production

const ENV = {
  dev: {
    // use LAN_IP from .env or fallback
    API_BASE: "http://10.233.33.102:5000", // 👈 replace with your LAN IPv4 from ipconfig
  },
  prod: {
    API_BASE: "https://your-production-domain.com", // fallback in prod
  },
};

const getEnvVars = () => {
  if (__DEV__) {
    return ENV.dev; // running locally
  }
  return ENV.prod; // production build
};

export default getEnvVars();
