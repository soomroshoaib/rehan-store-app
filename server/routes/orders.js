const router = require('express').Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

const FREE_DELIVERY_ABOVE = 3000;
const DELIVERY_FEE = 200;

// Payment instructions (shown to the customer at checkout)
router.get('/payment-info', (req, res) => {
  res.json({
    freeDeliveryAbove: FREE_DELIVERY_ABOVE,
    deliveryFee: DELIVERY_FEE,
    easypaisa: { number: process.env.EASYPAISA_NUMBER, title: process.env.EASYPAISA_TITLE },
    jazzcash: { number: process.env.JAZZCASH_NUMBER, title: process.env.JAZZCASH_TITLE },
  });
});

router.post('/', protect, async (req, res, next) => {
  try {
    const { items, shipping, paymentMethod, transactionId } = req.body;
    if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ message: 'Cart is empty' });
    if (!shipping || !shipping.fullName || !shipping.phone || !shipping.address || !shipping.city) {
      return res.status(400).json({ message: 'Please fill in all delivery details' });
    }
    if (!['COD', 'EASYPAISA', 'JAZZCASH'].includes(paymentMethod)) {
      return res.status(400).json({ message: 'Invalid payment method' });
    }
    if (paymentMethod !== 'COD' && !(transactionId || '').trim()) {
      return res.status(400).json({ message: 'Transaction ID is required' });
    }

    // Always use the server-side price; never trust the client's price
    const orderItems = [];
    let itemsTotal = 0;
    for (const it of items) {
      const qty = Math.floor(Number(it.qty));
      if (!qty || qty < 1) return res.status(400).json({ message: 'Invalid quantity' });
      const product = await Product.findById(it.product);
      if (!product || !product.active) return res.status(400).json({ message: 'A product in your cart is no longer available' });
      if (product.stock < qty) return res.status(400).json({ message: `Only ${product.stock} of ${product.name} left in stock` });
      const price = product.discountPrice && product.discountPrice < product.price ? product.discountPrice : product.price;
      orderItems.push({ product: product._id, name: product.name, image: product.image, price, qty, size: it.size || '' });
      itemsTotal += price * qty;
    }

    // Stock kam karo (atomic check ke saath)
    for (const oi of orderItems) {
      const r = await Product.updateOne({ _id: oi.product, stock: { $gte: oi.qty } }, { $inc: { stock: -oi.qty } });
      if (r.modifiedCount === 0) return res.status(400).json({ message: `${oi.name} is out of stock` });
    }

    const deliveryFee = itemsTotal >= FREE_DELIVERY_ABOVE ? 0 : DELIVERY_FEE;
    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      shipping,
      paymentMethod,
      transactionId: paymentMethod === 'COD' ? undefined : transactionId.trim(),
      paymentStatus: paymentMethod === 'COD' ? 'pending' : 'awaiting_verification',
      itemsTotal,
      deliveryFee,
      total: itemsTotal + deliveryFee,
    });
    res.status(201).json(order);
  } catch (e) {
    next(e);
  }
});

router.get('/mine', protect, async (req, res, next) => {
  try {
    res.json(await Order.find({ user: req.user._id }).sort({ createdAt: -1 }));
  } catch (e) {
    next(e);
  }
});

router.get('/:id', protect, async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order || (String(order.user) !== String(req.user._id) && req.user.role !== 'admin')) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (e) {
    next(e);
  }
});

module.exports = router;
