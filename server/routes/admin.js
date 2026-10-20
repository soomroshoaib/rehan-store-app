const router = require('express').Router();
const multer = require('multer');
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/auth');

const uploadDir = path.join(__dirname, '..', 'uploads');
fs.mkdirSync(uploadDir, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => cb(null, Date.now() + '-' + Math.round(Math.random() * 1e6) + path.extname(file.originalname).toLowerCase()),
  }),
  limits: { fileSize: 3 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (/^image\/(jpeg|png|webp)$/.test(file.mimetype)) return cb(null, true);
    cb(new Error('Only JPG, PNG or WEBP images are allowed'));
  },
});

router.use(protect, adminOnly);

// ---- Stats ----
router.get('/stats', async (req, res, next) => {
  try {
    const [products, orders, customers, revenueAgg, pendingPayments, lowStock, recent] = await Promise.all([
      Product.countDocuments(),
      Order.countDocuments(),
      User.countDocuments({ role: 'customer' }),
      Order.aggregate([
        { $match: { status: { $ne: 'cancelled' }, $or: [{ paymentStatus: 'paid' }, { paymentMethod: 'COD', status: 'delivered' }] } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
      Order.countDocuments({ paymentStatus: 'awaiting_verification' }),
      Product.find({ stock: { $lte: 5 }, active: true }).select('name stock').limit(10),
      Order.find().sort({ createdAt: -1 }).limit(5).populate('user', 'name'),
    ]);
    res.json({ products, orders, customers, revenue: revenueAgg[0]?.total || 0, pendingPayments, lowStock, recent });
  } catch (e) {
    next(e);
  }
});

// ---- Products ----
router.get('/products', async (req, res, next) => {
  try {
    res.json(await Product.find().sort({ createdAt: -1 }));
  } catch (e) {
    next(e);
  }
});

const clean = (b) => {
  const d = {
    name: b.name,
    description: b.description,
    category: b.category,
    price: Number(b.price),
    stock: Number(b.stock),
    featured: b.featured === true || b.featured === 'true',
    active: b.active === undefined ? true : b.active === true || b.active === 'true',
    sizes: Array.isArray(b.sizes) ? b.sizes : String(b.sizes || '').split(',').map((s) => s.trim()).filter(Boolean),
  };
  const hasDiscount = b.discountPrice !== undefined && b.discountPrice !== '' && b.discountPrice !== null;
  if (!(d.price > 0)) throw Object.assign(new Error('Price must be greater than 0'), { status: 400 });
  if (!(d.stock >= 0)) throw Object.assign(new Error('Stock must be 0 or more'), { status: 400 });
  if (hasDiscount) {
    d.discountPrice = Number(b.discountPrice);
    if (!(d.discountPrice > 0) || d.discountPrice >= d.price) {
      throw Object.assign(new Error('Discount price must be greater than 0 and lower than the price'), { status: 400 });
    }
  } else {
    d.$unset = { discountPrice: 1 }; // clearing the field removes the discount
  }
  return d;
};

const saveImage = async (file) => {
  const img = await Image.create({ data: file.buffer, contentType: file.mimetype });
  return '/api/images/' + img._id;
};

router.post('/products', upload.single('image'), async (req, res, next) => {
  try {
    const data = clean(req.body);
    if (req.file) data.image = await saveImage(req.file);
    delete data.$unset;
    res.status(201).json(await Product.create(data));
  } catch (e) {
    next(e);
  }
});

router.put('/products/:id', upload.single('image'), async (req, res, next) => {
  try {
    const data = clean(req.body);
    if (req.file) data.image = await saveImage(req.file);
    const p = await Product.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
    if (!p) return res.status(404).json({ message: 'Product not found' });
    res.json(p);
  } catch (e) {
    next(e);
  }
});

router.delete('/products/:id', async (req, res, next) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

// ---- Orders ----
router.get('/orders', async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.paymentStatus) filter.paymentStatus = req.query.paymentStatus;
    res.json(await Order.find(filter).sort({ createdAt: -1 }).populate('user', 'name email phone'));
  } catch (e) {
    next(e);
  }
});

router.patch('/orders/:id', async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    const { status, paymentStatus } = req.body;
    const wasCancelled = order.status === 'cancelled';

    if (status) {
      if (!['placed', 'confirmed', 'shipped', 'delivered', 'cancelled'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
      }
      // Restore stock when an order is cancelled
      if (status === 'cancelled' && !wasCancelled) {
        for (const it of order.items) await Product.updateOne({ _id: it.product }, { $inc: { stock: it.qty } });
      }
      if (wasCancelled && status !== 'cancelled') {
        return res.status(400).json({ message: 'A cancelled order cannot be reactivated' });
      }
      order.status = status;
      if (status === 'delivered' && order.paymentMethod === 'COD') order.paymentStatus = 'paid';
    }
    if (paymentStatus) {
      if (!['pending', 'awaiting_verification', 'paid', 'rejected'].includes(paymentStatus)) {
        return res.status(400).json({ message: 'Invalid payment status' });
      }
      order.paymentStatus = paymentStatus;
      if (paymentStatus === 'paid' && order.status === 'placed') order.status = 'confirmed';
    }
    await order.save();
    res.json(order);
  } catch (e) {
    next(e);
  }
});

// ---- Customers ----
router.get('/customers', async (req, res, next) => {
  try {
    res.json(await User.find({ role: 'customer' }).select('-password').sort({ createdAt: -1 }));
  } catch (e) {
    next(e);
  }
});

module.exports = router;
