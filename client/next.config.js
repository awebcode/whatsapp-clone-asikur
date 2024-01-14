/** @type {import("next").NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["lh3.googleusercontent.com", "localhost", "pngwing.com"],
  },
  env: {
    NEXT_PUBLIC_ZEGO_APP_ID: 575191098,
    NEXT_PUBLIC_ZEGO_SERVER_ID: "bfeb965535ae86e9744f8d72b0dd15ba",
    NEXT_PUBLIC_FIREBASE_API_KEY: "AIzaSyCm1RwUsrUrUFJR6iwfwqF88dr0BDZdYEE",
    NEXT_PUBLIC_BACKEND_URL: "http://localhost:3005",
  },
};

module.exports = nextConfig;
