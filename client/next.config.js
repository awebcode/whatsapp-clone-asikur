/** @type {import("next").NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["lh3.googleusercontent.com", "localhost", "pngwing.com"],
  },
  env: {
    NEXT_PUBLIC_ZEGO_APP_ID: 860014501,
    NEXT_PUBLIC_ZEGO_SERVER_ID: "458b61f8e100220cfce77a83ce180615",
    NEXT_PUBLIC_FIREBASE_API_KEY: "AIzaSyCm1RwUsrUrUFJR6iwfwqF88dr0BDZdYEE",
    NEXT_PUBLIC_BACKEND_URL: "http://localhost:3005",
  },
};

module.exports = nextConfig;
