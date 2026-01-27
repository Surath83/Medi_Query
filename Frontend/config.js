// config.js
// Handles API_BASE for dev (LAN IP) "http://10.123.255.102:5000" and production

const ENV = {
  dev: {
    // use LAN_IP from .env or fallback
    API_BASE: "http://192.168.29.252:5000",
    // API_BASE: "http://medi-query.onrender.com", // 👈 replace with your LAN IPv4 from ipconfig
  },
  prod: {
    API_BASE: "https://medi-query.onrender.com", // fallback in prod
  },
};

const getEnvVars = () => {
  if (__DEV__) {
    return ENV.dev; // running locally
  }
  return ENV.prod; // production build
};

export default getEnvVars();
