# CDN Implementation Guide

This document provides comprehensive guidance on implementing and configuring CDN (Content Delivery Network) for the Mirobaldo chatbot application.

## Overview

The application uses a flexible CDN configuration system that supports three providers:
1. **Local** - Serves images from the local `/fotografias` directory (default)
2. **Cloudinary** - Professional image CDN with on-the-fly optimization
3. **AWS S3** - Scalable storage with optional CloudFront distribution

## Architecture

### Core Components

#### `src/config/cdnConfig.js`
Singleton configuration system managing:
- Provider selection (local/cloudinary/s3)
- Image URL generation with transformations
- Cache headers and control
- Responsive image generation (srcset)
- HTML img tag generation

#### `src/utils/injectImages.js`
Updated utility for injecting images into biographies using CDN:
- Finds matching images for biographies
- Generates optimized image tags
- Supports CDN transformations
- Logs CDN provider information

### Configuration Flow

```
Environment Variables (NODE_ENV, CDN_PROVIDER)
          ↓
    CDNConfig Instance
          ↓
    Provider-specific Logic
          ↓
    Image URL + Transformations
          ↓
    Cache Headers
          ↓
    Client Response
```

## Configuration

### Local CDN (Default)

No additional configuration needed. Images are served from `/fotografias` directory.

**Environment:**
```env
CDN_PROVIDER=local
NODE_ENV=development
```

**Behavior:**
- Basic compression enabled
- 30-day cache TTL
- Cache busting in development (adds `?t=timestamp`)
- No external dependencies

### Cloudinary CDN

Professional image optimization service with global CDN.

**Setup Steps:**

1. **Create Cloudinary Account**
   - Visit https://cloudinary.com
   - Sign up for free account
   - Navigate to Dashboard

2. **Get Credentials**
   ```
   Cloud Name: Found in dashboard
   API Key: Found in dashboard
   Upload Preset: Settings → Upload → Unsigned presets
   ```

3. **Configuration**
   ```env
   CDN_PROVIDER=cloudinary
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_UPLOAD_PRESET=your_upload_preset
   CLOUDINARY_BASE_URL=https://res.cloudinary.com/your_cloud_name/image/upload
   ```

4. **Upload Images**
   ```bash
   # Using Cloudinary Upload API or Web UI
   # Upload images to: /public/fotografias/[category]/
   ```

**Benefits:**
- Automatic image optimization
- Format conversion (WebP, AVIF)
- Responsive image delivery
- Global CDN distribution
- Face detection and cropping

**URL Example:**
```
https://res.cloudinary.com/mycloud/image/upload/
  q_auto,f_auto,c_scale,w_auto,dpr_auto/
  public/fotografias/equipas/1990-91.jpeg
```

### AWS S3 + CloudFront CDN

Scalable storage with optional CloudFront distribution.

**Setup Steps:**

1. **Create AWS Account**
   - Visit https://aws.amazon.com
   - Create account or use existing

2. **Create S3 Bucket**
   ```bash
   aws s3 mb s3://mirobaldo-photos --region eu-west-1
   ```

3. **Configure Bucket**
   ```bash
   # Enable public read access
   # Set CORS policy for image loading
   # Configure bucket website hosting (optional)
   ```

4. **Create CloudFront Distribution (Optional)**
   - CloudFront caching layer
   - Global edge locations
   - Reduced bandwidth costs
   - SSL/TLS support

5. **Configuration**
   ```env
   CDN_PROVIDER=s3
   AWS_S3_BUCKET=mirobaldo-photos
   AWS_S3_REGION=eu-west-1
   AWS_ACCESS_KEY_ID=your_access_key
   AWS_SECRET_ACCESS_KEY=your_secret_key
   AWS_S3_BASE_URL=https://mirobaldo-photos.s3.eu-west-1.amazonaws.com
   AWS_CLOUDFRONT_DOMAIN=d123abc.cloudfront.net  # Optional
   ```

6. **Upload Images**
   ```bash
   aws s3 sync ./public/fotografias s3://mirobaldo-photos/fotografias
   ```

**Benefits:**
- High scalability
- Object lifecycle policies
- Access logging
- CloudFront global distribution
- Cost-effective for large deployments

## Usage Examples

### In Templates / Agents

```javascript
const { getInstance: getCDNConfig } = require('./config/cdnConfig');

const cdn = getCDNConfig();

// Get optimized image URL
const imageUrl = cdn.getImageUrl('equipas/1990-91.jpeg', {
  width: 640,
  quality: 'auto'
});

// Generate responsive srcset
const srcset = cdn.getSrcset('equipas/1990-91.jpeg', {
  widths: [320, 640, 1024]
});

// Generate complete img tag
const imgTag = cdn.generateImgTag(
  'equipas/1990-91.jpeg',
  'Team photo 1990-91',
  {
    width: 400,
    className: 'team-photo',
    style: 'border-radius: 8px;'
  }
);
```

### In Biographies

The `injectImages.js` utility automatically handles CDN configuration:

```bash
node src/utils/injectImages.js
```

Output shows:
```
🖼️  Iniciando injeção de imagens nas biografias...
📡 Usando CDN: cloudinary (advanced)
🔗 Base URL: https://res.cloudinary.com/mycloud/image/upload
```

### Cache Control

```javascript
const headers = cdn.getCacheHeaders();
// Returns: {
//   'Cache-Control': 'public, max-age=2592000',
//   'ETag': '"1635791234"',
//   'Vary': 'Accept-Encoding'
// }
```

## Performance Considerations

### Local CDN
- **Best for**: Development, small deployments
- **Bandwidth**: Server bandwidth only
- **Optimization**: Basic compression
- **Cache TTL**: 30 days
- **Cost**: None

### Cloudinary CDN
- **Best for**: Quality optimization, global reach
- **Bandwidth**: Cloudinary CDN costs (~$0.05/GB over free tier)
- **Optimization**: Advanced (format, quality, responsive)
- **Cache TTL**: 1 year (Cloudinary managed)
- **Cost**: Pay-per-use, free tier includes 25GB/month

### AWS S3 + CloudFront
- **Best for**: Scalable, high-traffic deployments
- **Bandwidth**: S3 ($0.02/GB) + CloudFront ($0.085-0.12/GB depending on location)
- **Optimization**: Manual or integrated with Lambda
- **Cache TTL**: 1 year (configurable)
- **Cost**: ~$0.02-0.14 per GB depending on setup

## Optimization Techniques

### Responsive Images

```javascript
// Generate different sizes for different devices
const smallUrl = cdn.getImageUrl('equipas/1990-91.jpeg', { width: 320 });
const mediumUrl = cdn.getImageUrl('equipas/1990-91.jpeg', { width: 640 });
const largeUrl = cdn.getImageUrl('equipas/1990-91.jpeg', { width: 1024 });

// Use srcset for automatic selection
const srcset = cdn.getSrcset('equipas/1990-91.jpeg');
```

### Format Optimization (Cloudinary)

```javascript
// Automatic format selection (WebP for supported browsers)
const transforms = cdn.buildCloudinaryTransforms({
  format: 'auto',
  quality: 'auto',
  responsive: true
});
```

### Lazy Loading

All generated img tags include `loading="lazy"` for deferred loading.

## Testing

Run tests to validate CDN configuration:

```bash
npm test -- src/__tests__/config/cdnConfig.test.js
```

Test coverage:
- ✅ Provider initialization
- ✅ URL generation for each provider
- ✅ Cloudinary transformations
- ✅ AWS S3 URL patterns
- ✅ Cache headers
- ✅ Responsive srcset generation
- ✅ HTML img tag generation
- ✅ Edge cases and error handling

## Migration Guide

### From Local to Cloudinary

1. **Setup Cloudinary account** (see above)
2. **Update `.env` file**
   ```env
   CDN_PROVIDER=cloudinary
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   ...
   ```
3. **Upload images to Cloudinary** (or configure automatic upload)
4. **Run image injection**
   ```bash
   node src/utils/injectImages.js
   ```
5. **Test locally**
   ```bash
   npm run dev
   ```
6. **Deploy to production**

### From Local to S3

1. **Create AWS S3 bucket and CloudFront distribution** (see above)
2. **Sync images to S3**
   ```bash
   aws s3 sync ./public/fotografias s3://your-bucket/fotografias
   ```
3. **Update `.env` file**
   ```env
   CDN_PROVIDER=s3
   AWS_S3_BUCKET=your-bucket
   AWS_CLOUDFRONT_DOMAIN=your-cloudfront.cloudfront.net
   ```
4. **Run image injection**
   ```bash
   node src/utils/injectImages.js
   ```
5. **Test and deploy**

## Troubleshooting

### Images not loading

**Check:**
1. CDN provider is accessible
2. Image paths are correct
3. CORS headers are configured (for S3/Cloudinary)
4. Browser cache is cleared

**Debug:**
```javascript
const cdn = getCDNConfig();
console.log(cdn.getStatus());
// Shows: { provider, baseUrl, optimization, cacheTTL, environment }
```

### Performance issues

**Optimize:**
1. Use appropriate image widths for devices
2. Enable format optimization
3. Configure CloudFront caching rules
4. Monitor cache hit rates

### CDN provider fallback

If configured CDN provider has issues, system automatically falls back to local CDN.

```javascript
// If Cloudinary credentials missing → falls back to local
// If S3 bucket not configured → falls back to local
```

## Future Improvements

- [ ] Automatic image upload to CDN on build
- [ ] Image optimization pipeline (resize, compress, format conversion)
- [ ] Cache invalidation triggers
- [ ] Analytics and monitoring dashboard
- [ ] A/B testing different optimizations
- [ ] WebP/AVIF format support validation

## References

- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [AWS S3 Best Practices](https://docs.aws.amazon.com/AmazonS3/latest/dev/BestPractices.html)
- [CloudFront Optimization](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/index.html)
- [Responsive Images MDN](https://developer.mozilla.org/en-US/docs/Learn/HTML/Multimedia_and_embedding/Responsive_images)
