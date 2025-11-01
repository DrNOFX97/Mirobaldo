/**
 * CDN Configuration System
 * Manages image serving strategy (local vs CDN)
 * Supports Cloudinary, AWS S3, and local fallback
 */

const fs = require('fs');
const path = require('path');

class CDNConfig {
  constructor() {
    // Environment-based configuration
    this.environment = process.env.NODE_ENV || 'development';
    this.cdnProvider = process.env.CDN_PROVIDER || 'local'; // 'local', 'cloudinary', 's3'

    // CDN Configuration
    this.config = {
      local: {
        baseUrl: '/fotografias',
        cacheTTL: 86400 * 30, // 30 days in seconds
        compression: true,
        optimization: 'basic'
      },
      cloudinary: {
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY,
        uploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET,
        baseUrl: process.env.CLOUDINARY_BASE_URL || `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`,
        cacheTTL: 86400 * 365, // 1 year (CDN manages caching)
        compression: true,
        optimization: 'advanced',
        transformations: {
          quality: 'auto',
          fetch_format: 'auto',
          responsive_width: true
        }
      },
      s3: {
        bucket: process.env.AWS_S3_BUCKET,
        region: process.env.AWS_S3_REGION || 'eu-west-1',
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        baseUrl: process.env.AWS_S3_BASE_URL,
        cacheTTL: 86400 * 365, // 1 year
        compression: true,
        optimization: 'advanced',
        cloudfront: process.env.AWS_CLOUDFRONT_DOMAIN
      }
    };

    this.validateConfiguration();
  }

  /**
   * Validate CDN configuration for the selected provider
   */
  validateConfiguration() {
    if (this.cdnProvider === 'cloudinary') {
      if (!this.config.cloudinary.cloudName) {
        console.warn('⚠️ Cloudinary CDN selected but CLOUDINARY_CLOUD_NAME not configured. Falling back to local.');
        this.cdnProvider = 'local';
      }
    } else if (this.cdnProvider === 's3') {
      if (!this.config.s3.bucket || !this.config.s3.region) {
        console.warn('⚠️ AWS S3 CDN selected but configuration incomplete. Falling back to local.');
        this.cdnProvider = 'local';
      }
    }
  }

  /**
   * Get image URL based on CDN provider
   * @param {string} imagePath - Relative image path (e.g., 'equipas/1990-91.jpeg')
   * @param {object} options - Transformation options
   * @returns {string} - Full image URL
   */
  getImageUrl(imagePath, options = {}) {
    switch (this.cdnProvider) {
      case 'cloudinary':
        return this.getCloudinaryUrl(imagePath, options);
      case 's3':
        return this.getS3Url(imagePath, options);
      default:
        return this.getLocalUrl(imagePath, options);
    }
  }

  /**
   * Get local image URL
   */
  getLocalUrl(imagePath, options = {}) {
    const encodedPath = encodeURIComponent(imagePath);
    let url = `${this.config.local.baseUrl}/${encodedPath}`;

    // Add cache busting in development
    if (this.environment === 'development' && options.cacheBust) {
      url += `?t=${Date.now()}`;
    }

    return url;
  }

  /**
   * Get Cloudinary CDN URL with transformations
   */
  getCloudinaryUrl(imagePath, options = {}) {
    const cfg = this.config.cloudinary;
    const transforms = this.buildCloudinaryTransforms(options);

    // Path format: /public/fotografias/equipas/1990-91.jpeg
    const normalizedPath = imagePath.replace(/^\//, '');

    let url = `${cfg.baseUrl}/${transforms}/${normalizedPath}`;

    return url;
  }

  /**
   * Build Cloudinary transformation string
   */
  buildCloudinaryTransforms(options = {}) {
    const transforms = [];
    const cfg = this.config.cloudinary.transformations;

    // Quality optimization
    if (options.quality !== false) {
      transforms.push(`q_${options.quality || cfg.quality}`);
    }

    // Format optimization
    if (options.format !== false) {
      transforms.push(`f_${options.format || cfg.fetch_format}`);
    }

    // Responsive images
    if (options.responsive !== false) {
      transforms.push('c_scale,w_auto,dpr_auto');
    }

    // Width constraint
    if (options.width) {
      transforms.push(`w_${options.width}`);
    }

    // Height constraint
    if (options.height) {
      transforms.push(`h_${options.height}`);
    }

    // Crop
    if (options.crop) {
      transforms.push(`c_${options.crop}`);
    }

    // Gravity
    if (options.gravity) {
      transforms.push(`g_${options.gravity}`);
    }

    return transforms.join(',');
  }

  /**
   * Get AWS S3 CDN URL
   */
  getS3Url(imagePath, options = {}) {
    const cfg = this.config.s3;
    const normalizedPath = imagePath.replace(/^\//, '');

    // Use CloudFront if available, otherwise S3 direct
    const baseUrl = cfg.cloudfront
      ? `https://${cfg.cloudfront}`
      : `https://${cfg.bucket}.s3.${cfg.region}.amazonaws.com`;

    let url = `${baseUrl}/${normalizedPath}`;

    // Add cache busting in development
    if (this.environment === 'development' && options.cacheBust) {
      url += `?t=${Date.now()}`;
    }

    return url;
  }

  /**
   * Get cache control headers
   */
  getCacheHeaders() {
    const cfg = this.config[this.cdnProvider];
    const ttl = cfg.cacheTTL;

    return {
      'Cache-Control': `public, max-age=${ttl}`,
      'ETag': `"${Date.now()}"`,
      'Vary': 'Accept-Encoding'
    };
  }

  /**
   * Get image srcset for responsive images
   */
  getSrcset(imagePath, options = {}) {
    const widths = options.widths || [320, 640, 1024, 1280];

    return widths
      .map(width => {
        const url = this.getImageUrl(imagePath, { width });
        return `${url} ${width}w`;
      })
      .join(', ');
  }

  /**
   * Get provider status and info
   */
  getStatus() {
    return {
      provider: this.cdnProvider,
      baseUrl: this.config[this.cdnProvider].baseUrl,
      compression: this.config[this.cdnProvider].compression,
      optimization: this.config[this.cdnProvider].optimization,
      cacheTTL: this.config[this.cdnProvider].cacheTTL,
      environment: this.environment
    };
  }

  /**
   * Batch convert image paths to URLs
   */
  batchGetImageUrls(imagePaths, options = {}) {
    return imagePaths.reduce((acc, imagePath) => {
      acc[imagePath] = this.getImageUrl(imagePath, options);
      return acc;
    }, {});
  }

  /**
   * Generate HTML img tag with optimal attributes
   */
  generateImgTag(imagePath, altText = '', options = {}) {
    const url = this.getImageUrl(imagePath, options);
    const srcset = this.getSrcset(imagePath, options);

    const width = options.width || 280;
    const height = options.height || 'auto';
    const className = options.className || '';
    const style = options.style || 'border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.15);';

    return `<img
      src="${url}"
      srcset="${srcset}"
      alt="${altText}"
      width="${width}"
      height="${height}"
      class="${className}"
      style="${style}"
      loading="lazy"
    />`;
  }
}

// Singleton instance
let instance = null;

module.exports = {
  // Get or create singleton
  getInstance() {
    if (!instance) {
      instance = new CDNConfig();
    }
    return instance;
  },

  // Direct class export for testing
  CDNConfig,

  // Middleware for setting cache headers
  cacheHeadersMiddleware: (req, res, next) => {
    const cdn = this.getInstance();
    const headers = cdn.getCacheHeaders();

    Object.entries(headers).forEach(([key, value]) => {
      res.setHeader(key, value);
    });

    next();
  }
};
