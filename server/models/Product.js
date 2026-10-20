const mongoose = require('mongoose');

const CATEGORIES = [
  'Cosmetics',
  'Skincare',
  'Face Creams & Beauty Products',
  'Personal Care',
  'Hair Care',
  'Soaps & Body Wash',
  'Perfumes & Fragrances',
  "Ladies' Shoes & Chappals",
  "Gents' Shoes & Chappals",
  "Kids' Shoes & Chappals",
  'Jewellery & Bangles',
  'Hair Accessories',
  'Hosiery',
  'Beads, Moti & Fancy Items',
  'Laces, Sitara & Nalki',
  'Threads & Sewing Accessories',
  'New Arrivals',
  'Best Sellers',
  'Special Offers & Sale',
];

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    category: { type: String, enum: CATEGORIES, default: 'Cosmetics' },
    price: { type: Number, required: true, min: 0 },
    discountPrice: { type: Number, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    image: { type: String, default: '' },
    sizes: [{ type: String }], // for shoes, e.g. 40, 41, 42
    featured: { type: Boolean, default: false },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

productSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Product', productSchema);
module.exports.CATEGORIES = CATEGORIES;
