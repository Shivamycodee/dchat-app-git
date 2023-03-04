/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  devIndicators: {
    // autoPrerender: false,
    // make sure this is set to true
    buildActivity: true,
  },
};


module.exports = nextConfig
