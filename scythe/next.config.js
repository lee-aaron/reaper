/** @type {import('next').NextConfig} */
const { PHASE_DEVELOPMENT_SERVER } = require("next/constants");

const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
})

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
            destination: "http://127.0.0.1:8000/api/:path*",
          },
        ];
      },
    };
  }
  return {
    ...defaultConfig,
    swcMinify: true,
    poweredByHeader: false,
    images: {
      loader: "akamai",
      path: "/"
    },
  };
};

if (process.env.ANALYZE === "true") {
  module.exports = withBundleAnalyzer(nextConfig);
} else {
  module.exports = nextConfig;
}
