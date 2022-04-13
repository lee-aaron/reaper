/** @type {import('next').NextConfig} */
const { PHASE_DEVELOPMENT_SERVER } = require('next/constants')

const nextConfig = (phase, { defaultConfig }) => {
  if (phase === PHASE_DEVELOPMENT_SERVER) {
    return {
      ...defaultConfig,
      reactStrictMode: true,
      async rewrites() {
        return [
          {
            source: "/api",
            destination: "http://localhost:8000/api",
          },
        ];
      },
    };
  }
  return {
    ...defaultConfig,
    reactStrictMode: true,
    poweredByHeader: false,
  };
};

module.exports = nextConfig;
