/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

// Conditionally apply Sentry only if auth token is available
if (process.env.SENTRY_AUTH_TOKEN) {
  const { withSentryConfig } = require('@sentry/nextjs');
  
  module.exports = withSentryConfig(nextConfig, {
    org: 'texas-am-sv',
    project: 'javascript-nextjs',
    silent: !process.env.CI,
    widenClientFileUpload: true,
    tunnelRoute: '/monitoring',
    disableLogger: true,
    automaticVercelMonitors: true,
    errorHandler: (err, invokeErr, compilation) => {
      console.warn('Sentry error (non-blocking):', err.message);
    },
  });
} else {
  module.exports = nextConfig;
}
