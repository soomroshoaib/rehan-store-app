const router = require('express').Router();
const Product = require('../models/Product');
const { CATEGORIES } = require('../models/Product');

// Public: list with search, category, price filter, sort, pagination
router.get('/', async (req, res, next) => {
  try {
    const { q, category, minPrice, maxPrice, sort, featured, page = 1, limit = 12 } = req.query;
    const filter = { active: true };
    // price actually paid: discountPrice when it is a real discount, otherwise price
    const finalPrice = { $cond: [{ $and: [{ $gt: ['$discountPrice', 0] }, { $lt: ['$discountPrice', '$price'] }] }, '$discountPrice', '$price'] };
    if (q) filter.name = { $regex: q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };
    if (category && category !== 'All') filter.category = category;
    if (featured === 'true') filter.featured = true;
    if (minPrice || maxPrice) {
      filter.finalPrice = {};
      if (minPrice) filter.finalPrice.$gte = Number(minPrice);
      if (maxPrice) filter.finalPrice.$lte = Number(maxPrice);
    }
    const sortMap = { 'price-asc': { finalPrice: 1, _id: 1 }, 'price-desc': { finalPrice: -1, _id: 1 }, newest: { createdAt: -1, _id: 1 } };
    const p = Math.max(1, Number(page));
    const l = Math.min(48, Math.max(1, Number(limit)));
    const [items, total] = await Promise.all([
      Product.aggregate([
        { $addFields: { finalPrice } },
        { $match: filter },
        { $sort: sortMap[sort] || sortMap.newest },
        { $skip: (p - 1) * l },
        { $limit: l },
      ]),
      Product.aggregate([{ $addFields: { finalPrice } }, { $match: filter }, { $count: 'n' }]).then((r) => r[0]?.n || 0),
    ]);
    res.json({ items, total, page: p, pages: Math.ceil(total / l) });
  } catch (e) {
    next(e);
  }
});

router.get('/categories', (req, res) => res.json(CATEGORIES));

router.get('/:id', async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product || !product.active) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (e) {
    next(e);
  }
});

module.exports = router;
