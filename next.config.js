const nextConfig = {
  reactStrictMode: false,
  images: {
    domains: [
      'images.unsplash.com',
      'i.ibb.co',
      'scontent.fotp8-1.fna.fbcdn.net',
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/a/**',
      },
      {
        protocol: 'https',
        hostname: '*.googleusercontent.com',
        port: '',
        pathname: '**',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    // Disable webpack cache to prevent warnings
    config.cache = false;
    
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        net: false,
        tls: false,
      };
    }

    // Add experiments configuration
    config.experiments = {
      ...config.experiments,
      topLevelAwait: true,
    };

    return config;
  },
  // Update experimental features with proper configuration
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
      allowedOrigins: ['localhost:3000']
    }
  }
};

module.exports = nextConfig;