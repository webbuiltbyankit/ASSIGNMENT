# FORME — Image Art Direction & Visual Identity Guide

## 1. Brand Essence & Atmosphere
- **Brand Positioning**: "Modern Everyday Wear" — understated luxury, considered silhouettes, timeless craftsmanship.
- **Palette Principles**: Warm Ivory (`#F5F2EC`), Sand (`#D8CBB8`), Charcoal (`#252525`), and Taupe (`#8A7968`). Soft earthy undertones with tactile natural textiles (raw linen, heavy cotton twill, merino wool, washed denim).
- **Light & Atmosphere**: Soft, diffused natural morning/afternoon side-lighting. Clean architectural lines, subtle wall textures (limewash, smooth plaster, minimal concrete), zero harsh artificial neon or high-contrast chromatic flares.

## 2. Garment Representation Rules
- **Silhouette & Fit**: Relaxed yet structured tailoring. True-to-life drape, seams, buttons, and hemlines.
- **Honesty in Imagery**: No fake sustainability logos, imaginary certification stamps, or artificial claims baked into images.
- **Typography & Pricing**: NEVER baked into photographs. All prices, titles, badges, and typography live strictly in semantic HTML/CSS.

## 3. Image Shot Templates & Ratios
- **Hero Desktop (16:9)**: Widescreen landscape editorial view. Model or setting composed to leave intentional negative space for HTML typography on either the left or right third.
- **Hero Mobile (4:5)**: Vertical art-directed crop prioritizing garment fit and upper silhouette.
- **Editorial & Campaign (3:4)**: Vertical atmospheric story and collection header photography.
- **Catalog Trilogy (4:5)**:
  1. *Primary / Front View*: Full or three-quarter frontal view showcasing overall fit, collar, and drape.
  2. *Secondary / Angle or Movement View*: Natural posture, side profile, or candid stride revealing garment movement.
  3. *Detail / Texture View*: Macro close-up on fabric weave, stitch detailing, buttons, or pocket construction.

## 4. Reusable Generation Prompt Recipes

### Positive Prompt Template:
```
Editorial fashion photography for FORME clothing collection, [MALE/FEMALE/UNISEX] model wearing [GARMENT_NAME] in [COLOR], natural organic [FABRIC_TYPE] texture, relaxed contemporary silhouette, muted neutral color palette of warm ivory and sand, soft directional window light, minimalist studio backdrop, high-end editorial styling, shot on medium format 85mm lens, f/2.8, realistic fabric weave, natural skin texture, candid pose, unobtrusive atmosphere.
```

### Negative Prompt Template:
```
distorted hands, missing fingers, extra limbs, malformed clothing, asymmetrical collars where not intended, logos, text, watermarks, bad anatomy, over-saturated colors, artificial neon lighting, shiny plastic skin, 3d render, CGI, cartoon, blurry, low resolution, crowded background, clutter.
```

## 5. Media Pipeline & Derivatives
- Original master files saved in `assets/source/{campaign,catalog,story}`.
- Deterministic filenames: `[slug]-[view].jpg` or `.png`.
- SHA-256 hash verified and registered in `asset-manifest.json`.
- Responsive variants generated or transformed through Cloudinary `f_auto,q_auto`.
