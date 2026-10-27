import mongoose from 'mongoose';

const sizeVariantSchema = new mongoose.Schema(
  {
    variantId: {
      type: String,
      required: true,
      trim: true,
    },
    size: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    stock: {
      type: Number,
      required: true,
      min: [0, 'Stock cannot be negative'],
      default: 0,
      validate: {
        validator: Number.isInteger,
        message: 'Stock must be an integer',
      },
    },
  },
  { _id: false }
);

const imageEntrySchema = new mongoose.Schema(
  {
    assetId: { type: String, required: true },
    secureUrl: { type: String, default: null },
    publicId: { type: String, default: null },
    alt: { type: String, default: '' },
    role: { type: String, enum: ['primary', 'gallery', 'fallback'], default: 'gallery' },
    view: { type: String, default: 'front' },
    width: { type: Number },
    height: { type: Number },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [150, 'Name cannot exceed 150 characters'],
    },
    slug: {
      type: String,
      required: [true, 'Product slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    // Price stored internally in integer paise (1 INR = 100 paise)
    pricePaise: {
      type: Number,
      required: [true, 'Price is required'],
      min: [100, 'Price must be at least 1 INR (100 paise)'],
      validate: {
        validator: Number.isInteger,
        message: 'Price must be stored as integer minor units (paise)',
      },
      index: true,
    },
    collection: {
      type: String,
      enum: {
        values: ['men', 'women'],
        message: '{VALUE} is not a valid collection (expected men or women)',
      },
      required: true,
      index: true,
    },
    category: {
      type: String,
      required: [true, 'Category slug is required'],
      trim: true,
      lowercase: true,
      index: true,
    },
    color: {
      type: String,
      trim: true,
    },
    fabric: {
      type: String,
      trim: true,
    },
    care: {
      type: String,
      trim: true,
    },
    sizes: {
      type: [sizeVariantSchema],
      default: [],
      validate: {
        validator: (v) => Array.isArray(v) && v.length > 0,
        message: 'Product must have at least one size variant',
      },
    },
    images: {
      type: [imageEntrySchema],
      default: [],
    },
    coverImage: {
      type: String,
      default: null,
    },
    featured: {
      type: Boolean,
      default: false,
      index: true,
    },
    active: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    suppressReservedKeysWarning: true,
  }
);

// Compound indexes for catalog queries
productSchema.index({ collection: 1, active: 1, createdAt: -1 });
productSchema.index({ category: 1, active: 1, pricePaise: 1 });
productSchema.index({ name: 'text', description: 'text', color: 'text', fabric: 'text' });

// Virtual total stock
productSchema.virtual('totalStock').get(function () {
  if (!this.sizes || !Array.isArray(this.sizes)) return 0;
  return this.sizes.reduce((sum, s) => sum + (s.stock || 0), 0);
});

productSchema.methods.toPublicJSON = function () {
  const totalStock = this.sizes?.reduce((sum, s) => sum + (s.stock || 0), 0) || 0;
  const inStock = totalStock > 0;
  const price = Math.round(this.pricePaise / 100);

  return {
    id: this._id.toString(),
    slug: this.slug,
    name: this.name,
    collection: this.collection,
    category: this.category,
    price,
    pricePaise: this.pricePaise,
    color: this.color || null,
    fabric: this.fabric || null,
    description: this.description,
    care: this.care || null,
    featured: this.featured,
    active: this.active,
    inStock,
    totalStock,
    coverImage: this.coverImage || this.images?.[0]?.assetId || null,
    images: (this.images || []).map((img) => ({
      assetId: img.assetId,
      secureUrl: img.secureUrl || null,
      alt: img.alt || `${this.name} ${img.view || ''}`,
      role: img.role,
      view: img.view,
    })),
    sizes: (this.sizes || []).map((s) => ({
      variantId: s.variantId,
      size: s.size,
      stock: s.stock,
      isAvailable: s.stock > 0,
    })),
    createdAt: this.createdAt,
  };
};

productSchema.methods.toAdminJSON = function () {
  const publicData = this.toPublicJSON();
  return {
    ...publicData,
    images: this.images,
    updatedAt: this.updatedAt,
  };
};

export const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
