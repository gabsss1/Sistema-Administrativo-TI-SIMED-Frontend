/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimizaciones de performance
  experimental: {
    // Optimización de CSS
    optimizeCss: true,
    // Compilación más rápida
    turbo: {
      loaders: {},
    },
  },

  // Compresión de imágenes
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Headers para caching
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=60, stale-while-revalidate=300',
          },
        ],
      },
    ]
  },

  // Optimización de bundles
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Optimizaciones adicionales
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: {
            minChunks: 1,
            priority: -20,
            reuseExistingChunk: true,
          },
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: -10,
            chunks: 'all',
          },
          common: {
            name: 'common',
            minChunks: 2,
            priority: -5,
            chunks: 'all',
            enforce: true,
          },
          // Separar librerías pesadas
          sweetalert: {
            test: /[\\/]node_modules[\\/]sweetalert2[\\/]/,
            name: 'sweetalert2',
            chunks: 'all',
            priority: 10,
          },
          lucide: {
            test: /[\\/]node_modules[\\/]lucide-react[\\/]/,
            name: 'lucide-react',
            chunks: 'all',
            priority: 10,
          },
        },
      }
    }

    // Optimizaciones para desarrollo
    if (dev) {
      config.cache = {
        type: 'filesystem',
        buildDependencies: {
          config: [__filename],
        },
      }
    }
    
    return config
  },

  // Comprimir respuestas
  compress: true,

  // Optimizar fuentes
  optimizeFonts: true,

  // Generar PWA manifest
  generateEtags: true,
}

module.exports = nextConfig