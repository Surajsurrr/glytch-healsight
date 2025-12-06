const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'Medicines',
        'Medical Equipment',
        'Personal Care',
        'Health Supplements',
        'First Aid',
        'Diagnostic Tools',
        'Surgical Supplies',
        'Baby Care',
        'Elderly Care',
        'Other',
      ],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    discountPrice: {
      type: Number,
      min: [0, 'Discount price cannot be negative'],
    },
    stock: {
      type: Number,
      required: [true, 'Stock quantity is required'],
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },
    manufacturer: {
      type: String,
      trim: true,
    },
    expiryDate: {
      type: Date,
    },
    batchNumber: {
      type: String,
      trim: true,
    },
    prescriptionRequired: {
      type: Boolean,
      default: false,
    },
    images: [
      {
        url: String,
        altText: String,
      },
    ],
    specifications: {
      dosage: String,
      composition: String,
      sideEffects: String,
      usage: String,
      storage: String,
      weight: String,
      dimensions: String,
    },
    tags: [String],
    status: {
      type: String,
      enum: ['active', 'inactive', 'out_of_stock', 'discontinued'],
      default: 'active',
    },
    ratings: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
      count: {
        type: Number,
        default: 0,
      },
    },
    soldCount: {
      type: Number,
      default: 0,
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for search
productSchema.index({ name: 'text', description: 'text', tags: 'text' });

// Virtual for discount percentage
productSchema.virtual('discountPercentage').get(function () {
  if (this.discountPrice && this.price > this.discountPrice) {
    return Math.round(((this.price - this.discountPrice) / this.price) * 100);
  }
  return 0;
});

// Update status based on stock
productSchema.pre('save', function (next) {
  if (this.stock === 0 && this.status === 'active') {
    this.status = 'out_of_stock';
  } else if (this.stock > 0 && this.status === 'out_of_stock') {
    this.status = 'active';
  }
  next();
});

module.exports = mongoose.model('Product', productSchema);
