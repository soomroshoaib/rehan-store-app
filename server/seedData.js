const User = require('./models/User');
const Product = require('./models/Product');

const sample = [
  { name: 'Glow Whitening Face Cream', category: 'Face Creams & Beauty Products', price: 850, discountPrice: 699, stock: 40, featured: true, description: 'Lightweight whitening cream for daily use, with SPF 30.' },
  { name: 'Aloe Vera Moisturizing Cream', category: 'Face Creams & Beauty Products', price: 600, stock: 55, description: 'Moisturizing cream for dry skin.' },
  { name: 'Ocean Breeze Body Spray', category: 'Perfumes & Fragrances', price: 750, discountPrice: 650, stock: 60, featured: true, description: 'A fresh, long-lasting fragrance that stays all day.' },
  { name: 'Black Oud Body Spray', category: 'Perfumes & Fragrances', price: 900, stock: 35, description: 'Deep, rich oud fragrance.' },
  { name: 'Classic Running Shoes', category: "Gents' Shoes & Chappals", price: 4200, discountPrice: 3600, stock: 25, featured: true, sizes: ['40', '41', '42', '43', '44'], description: 'Lightweight, comfortable running shoes.' },
  { name: 'Casual Sneakers White', category: "Gents' Shoes & Chappals", price: 3800, stock: 18, sizes: ['39', '40', '41', '42', '43'], description: 'Sneakers that go with every outfit.' },
];

// Admin and sample products are created only if none exist yet
// Moves products from old categories to the new ones
const OLD_TO_NEW = {
  Cream: 'Face Creams & Beauty Products',
  'Body Spray': 'Perfumes & Fragrances',
  Perfume: 'Perfumes & Fragrances',
  Shoes: "Gents' Shoes & Chappals",
  Clothes: 'Hosiery',
  Accessories: 'Hair Accessories',
  Other: 'Cosmetics',
};

module.exports = async function seedData() {
  for (const [from, to] of Object.entries(OLD_TO_NEW)) {
    await Product.collection.updateMany({ category: from }, { $set: { category: to } });
  }
  const email = (process.env.ADMIN_EMAIL || 'admin@rehanstore.com').toLowerCase();
  if (!(await User.findOne({ email }))) {
    await User.create({ name: 'Rehan (Admin)', email, password: process.env.ADMIN_PASSWORD || 'Admin@12345', role: 'admin' });
    console.log('Admin account bana:', email);
  }
  if ((await Product.countDocuments()) === 0) {
    await Product.insertMany(sample);
    console.log('Sample products add ho gaye');
  }
};
