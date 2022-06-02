/** @type {import('next').NextConfig} */
const { PHASE_DEVELOPMENT_SERVER } = require("next/constants");

const nextConfig = (phase, { defaultConfig }) => {
  if (phase === PHASE_DEVELOPMENT_SERVER) {
    return {
      ...defaultConfig,
      reactStrictMode: true,
      swcMinify: true,
      async rewrites() {
        return [
          {
            source: "/api/:path*",
            destination: "http://127.0.0.1:8000/:path*",
          },
        ];
      },
    };
  }
  return {
    ...defaultConfig,
    swcMinify: true,
    poweredByHeader: false,
  };
};

module.exports = nextConfig;
