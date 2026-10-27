import { z } from 'zod';

/**
 * Reusable validation middleware using Zod schemas
 */
export function validate(schema, source = 'body') {
  return async (req, res, next) => {
    try {
      const dataToValidate = req[source];

      // Defend against Mongo query operator injection in raw objects
      if (typeof dataToValidate === 'object' && dataToValidate !== null) {
        checkNoMongoOperators(dataToValidate);
      }

      const parsed = await schema.parseAsync(dataToValidate);
      req[source] = parsed;
      next();
    } catch (err) {
      if (err instanceof z.ZodError) {
        const details = {};
        for (const issue of err.issues) {
          const field = issue.path.join('.') || 'root';
          details[field] = issue.message;
        }

        return res.status(400).json({
          success: false,
          error: {
            code: 'ERR_VALIDATION_FAILED',
            message: 'Input validation failed. Please correct the highlighted errors.',
            details,
          },
        });
      }

      return res.status(400).json({
        success: false,
        error: {
          code: 'ERR_INVALID_PAYLOAD',
          message: err.message || 'Invalid request payload structure.',
        },
      });
    }
  };
}

/**
 * Recursively inspects payload to reject any keys starting with '$' (Mongo query injection)
 */
function checkNoMongoOperators(obj) {
  for (const [key, val] of Object.entries(obj)) {
    if (key.startsWith('$')) {
      throw new Error(`Forbidden property name "${key}"`);
    }
    if (typeof val === 'object' && val !== null) {
      checkNoMongoOperators(val);
    }
  }
}

// ==========================================
// COMMON ZOD SCHEMAS
// ==========================================

export const registerSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .max(120, 'Email cannot exceed 120 characters')
    .email('Invalid email address format'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .max(72, 'Password cannot exceed 72 characters'),
  name: z.string().trim().max(100, 'Name cannot exceed 100 characters').optional(),
});

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .email('Invalid email address format'),
  password: z.string().min(1, 'Password is required'),
});

export const cartQuoteSchema = z.object({
  lines: z
    .array(
      z.object({
        productId: z.string().min(1, 'productId is required'),
        variantId: z.string().min(1, 'variantId is required'),
        quantity: z.number().int().min(1, 'Quantity must be at least 1').max(10, 'Max 10 per item'),
      })
    )
    .max(25, 'Maximum 25 line items allowed per cart'),
});

export const productCreateSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(150),
  slug: z.string().trim().min(2).max(150).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  description: z.string().trim().min(5, 'Description is required'),
  price: z.number().min(1, 'Price must be positive'),
  collection: z.enum(['men', 'women']),
  category: z.string().trim().min(1),
  color: z.string().trim().optional(),
  fabric: z.string().trim().optional(),
  care: z.string().trim().optional(),
  active: z.boolean().default(true),
  featured: z.boolean().default(false),
  sizes: z
    .array(
      z.object({
        variantId: z.string().min(1),
        size: z.string().min(1),
        stock: z.number().int().min(0),
      })
    )
    .min(1, 'At least one size variant required'),
  images: z
    .array(
      z.object({
        assetId: z.string(),
        secureUrl: z.string().nullable().optional(),
        publicId: z.string().nullable().optional(),
        alt: z.string().optional(),
        role: z.string().optional(),
        view: z.string().optional(),
      })
    )
    .optional(),
  coverImage: z.string().nullable().optional(),
});
