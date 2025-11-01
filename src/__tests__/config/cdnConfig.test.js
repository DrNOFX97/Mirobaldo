/**
 * CDN Configuration Tests
 * Tests the CDN configuration system for multiple providers
 */

const { CDNConfig } = require('../../config/cdnConfig');

describe('CDNConfig', () => {
  describe('Initialization', () => {
    it('should create instance with default local CDN', () => {
      const cdn = new CDNConfig();
      expect(cdn.cdnProvider).toBe('local');
    });

    it('should have local configuration by default', () => {
      const cdn = new CDNConfig();
      const config = cdn.config.local;
      expect(config.baseUrl).toBe('/fotografias');
      expect(config.compression).toBe(true);
      expect(config.cacheTTL).toBe(86400 * 30);
    });

    it('should validate configuration on init', () => {
      const cdn = new CDNConfig();
      expect(cdn.cdnProvider).toBeDefined();
    });
  });

  describe('Local CDN', () => {
    let cdn;

    beforeEach(() => {
      cdn = new CDNConfig();
      process.env.CDN_PROVIDER = 'local';
    });

    it('should generate local image URL', () => {
      const url = cdn.getImageUrl('equipas/1990-91.jpeg');
      expect(url).toContain('/fotografias/');
      expect(url).toContain('1990-91.jpeg');
    });

    it('should encode special characters in URL', () => {
      const url = cdn.getImageUrl('jogadores/João Silva.png');
      expect(url).toContain('encodeURIComponent');
      expect(url).not.toContain('João');
    });

    it('should add cache busting in development', () => {
      process.env.NODE_ENV = 'development';
      const cdn2 = new CDNConfig();
      const url = cdn2.getImageUrl('equipas/1990-91.jpeg', { cacheBust: true });
      expect(url).toContain('?t=');
    });

    it('should not add cache busting in production', () => {
      process.env.NODE_ENV = 'production';
      const cdn2 = new CDNConfig();
      const url = cdn2.getImageUrl('equipas/1990-91.jpeg', { cacheBust: true });
      expect(url).not.toContain('?t=');
    });
  });

  describe('Cloudinary CDN', () => {
    let cdn;

    beforeEach(() => {
      process.env.CDN_PROVIDER = 'cloudinary';
      process.env.CLOUDINARY_CLOUD_NAME = 'test-cloud';
      process.env.CLOUDINARY_API_KEY = 'test-key';
      cdn = new CDNConfig();
    });

    it('should fallback to local if Cloudinary not configured', () => {
      delete process.env.CLOUDINARY_CLOUD_NAME;
      const cdn2 = new CDNConfig();
      expect(cdn2.cdnProvider).toBe('local');
    });

    it('should generate Cloudinary URL with transformations', () => {
      const url = cdn.getImageUrl('equipas/1990-91.jpeg');
      expect(url).toContain('res.cloudinary.com');
      expect(url).toContain('test-cloud');
    });

    it('should support width transformation', () => {
      const transforms = cdn.buildCloudinaryTransforms({ width: 640 });
      expect(transforms).toContain('w_640');
    });

    it('should support quality optimization', () => {
      const transforms = cdn.buildCloudinaryTransforms({ quality: 'auto' });
      expect(transforms).toContain('q_auto');
    });

    it('should support format optimization', () => {
      const transforms = cdn.buildCloudinaryTransforms({ format: 'auto' });
      expect(transforms).toContain('f_auto');
    });

    it('should support responsive transformations', () => {
      const transforms = cdn.buildCloudinaryTransforms({ responsive: true });
      expect(transforms).toContain('c_scale');
      expect(transforms).toContain('w_auto');
    });

    it('should support crop and gravity', () => {
      const transforms = cdn.buildCloudinaryTransforms({
        crop: 'fill',
        gravity: 'face'
      });
      expect(transforms).toContain('c_fill');
      expect(transforms).toContain('g_face');
    });
  });

  describe('AWS S3 CDN', () => {
    let cdn;

    beforeEach(() => {
      process.env.CDN_PROVIDER = 's3';
      process.env.AWS_S3_BUCKET = 'test-bucket';
      process.env.AWS_S3_REGION = 'eu-west-1';
      cdn = new CDNConfig();
    });

    it('should fallback to local if S3 not configured', () => {
      delete process.env.AWS_S3_BUCKET;
      const cdn2 = new CDNConfig();
      expect(cdn2.cdnProvider).toBe('local');
    });

    it('should generate S3 URL without CloudFront', () => {
      const url = cdn.getImageUrl('equipas/1990-91.jpeg');
      expect(url).toContain('s3.eu-west-1.amazonaws.com');
      expect(url).toContain('test-bucket');
    });

    it('should generate CloudFront URL when configured', () => {
      process.env.AWS_CLOUDFRONT_DOMAIN = 'cdn.example.com';
      const cdn2 = new CDNConfig();
      const url = cdn2.getImageUrl('equipas/1990-91.jpeg');
      expect(url).toContain('cdn.example.com');
    });
  });

  describe('Cache Headers', () => {
    it('should return proper cache headers for local CDN', () => {
      const cdn = new CDNConfig();
      const headers = cdn.getCacheHeaders();
      expect(headers['Cache-Control']).toContain('public');
      expect(headers['Cache-Control']).toContain('max-age');
      expect(headers).toHaveProperty('ETag');
      expect(headers).toHaveProperty('Vary');
    });

    it('should set TTL for 30 days on local CDN', () => {
      const cdn = new CDNConfig();
      const headers = cdn.getCacheHeaders();
      const ttl = 86400 * 30;
      expect(headers['Cache-Control']).toContain(`max-age=${ttl}`);
    });

    it('should set TTL for 1 year on Cloudinary', () => {
      process.env.CDN_PROVIDER = 'cloudinary';
      process.env.CLOUDINARY_CLOUD_NAME = 'test-cloud';
      const cdn = new CDNConfig();
      const headers = cdn.getCacheHeaders();
      const ttl = 86400 * 365;
      expect(headers['Cache-Control']).toContain(`max-age=${ttl}`);
    });
  });

  describe('Responsive Images', () => {
    it('should generate srcset for multiple widths', () => {
      const cdn = new CDNConfig();
      const srcset = cdn.getSrcset('equipas/1990-91.jpeg');
      expect(srcset).toContain('320w');
      expect(srcset).toContain('640w');
      expect(srcset).toContain('1024w');
      expect(srcset).toContain('1280w');
    });

    it('should support custom widths', () => {
      const cdn = new CDNConfig();
      const srcset = cdn.getSrcset('equipas/1990-91.jpeg', {
        widths: [480, 960]
      });
      expect(srcset).toContain('480w');
      expect(srcset).toContain('960w');
      expect(srcset).not.toContain('320w');
    });
  });

  describe('HTML Generation', () => {
    it('should generate valid img tag', () => {
      const cdn = new CDNConfig();
      const tag = cdn.generateImgTag('equipas/1990-91.jpeg', 'Team photo');
      expect(tag).toContain('<img');
      expect(tag).toContain('src=');
      expect(tag).toContain('srcset=');
      expect(tag).toContain('alt="Team photo"');
      expect(tag).toContain('loading="lazy"');
    });

    it('should include width and height attributes', () => {
      const cdn = new CDNConfig();
      const tag = cdn.generateImgTag('equipas/1990-91.jpeg', 'Team', {
        width: 400,
        height: 300
      });
      expect(tag).toContain('width="400"');
      expect(tag).toContain('height="300"');
    });

    it('should support custom styling', () => {
      const cdn = new CDNConfig();
      const customStyle = 'border: 1px solid red;';
      const tag = cdn.generateImgTag('equipas/1990-91.jpeg', 'Team', {
        style: customStyle
      });
      expect(tag).toContain(customStyle);
    });

    it('should support custom classes', () => {
      const cdn = new CDNConfig();
      const tag = cdn.generateImgTag('equipas/1990-91.jpeg', 'Team', {
        className: 'responsive-image shadow'
      });
      expect(tag).toContain('class="responsive-image shadow"');
    });
  });

  describe('Batch Operations', () => {
    it('should batch convert image paths to URLs', () => {
      const cdn = new CDNConfig();
      const paths = ['equipas/1990-91.jpeg', 'jogadores/player.png'];
      const urls = cdn.batchGetImageUrls(paths);
      expect(Object.keys(urls)).toHaveLength(2);
      expect(urls['equipas/1990-91.jpeg']).toContain('/fotografias/');
      expect(urls['jogadores/player.png']).toContain('/fotografias/');
    });
  });

  describe('Status and Configuration', () => {
    it('should return provider status', () => {
      const cdn = new CDNConfig();
      const status = cdn.getStatus();
      expect(status).toHaveProperty('provider');
      expect(status).toHaveProperty('baseUrl');
      expect(status).toHaveProperty('compression');
      expect(status).toHaveProperty('optimization');
      expect(status).toHaveProperty('cacheTTL');
      expect(status).toHaveProperty('environment');
    });

    it('should show local optimization level for local CDN', () => {
      const cdn = new CDNConfig();
      const status = cdn.getStatus();
      expect(status.optimization).toBe('basic');
    });

    it('should show advanced optimization level for Cloudinary', () => {
      process.env.CDN_PROVIDER = 'cloudinary';
      process.env.CLOUDINARY_CLOUD_NAME = 'test-cloud';
      const cdn = new CDNConfig();
      const status = cdn.getStatus();
      expect(status.optimization).toBe('advanced');
    });
  });

  describe('Edge Cases', () => {
    it('should handle paths with leading slashes', () => {
      const cdn = new CDNConfig();
      const url = cdn.getImageUrl('/equipas/1990-91.jpeg');
      expect(url).toContain('fotografias');
    });

    it('should handle paths with special characters', () => {
      const cdn = new CDNConfig();
      const url = cdn.getImageUrl('jogadores/Zé Rafael.png');
      expect(typeof url).toBe('string');
      expect(url.length).toBeGreaterThan(0);
    });

    it('should handle empty transformations', () => {
      const cdn = new CDNConfig();
      const url = cdn.getImageUrl('equipas/1990-91.jpeg', {});
      expect(typeof url).toBe('string');
      expect(url.length).toBeGreaterThan(0);
    });

    it('should disable individual optimizations', () => {
      process.env.CDN_PROVIDER = 'cloudinary';
      process.env.CLOUDINARY_CLOUD_NAME = 'test-cloud';
      const cdn = new CDNConfig();
      const transforms = cdn.buildCloudinaryTransforms({
        quality: false,
        format: false,
        responsive: false
      });
      expect(transforms).not.toContain('q_');
      expect(transforms).not.toContain('f_');
      expect(transforms).not.toContain('c_scale');
    });
  });
});
