const router = require('express').Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const sign = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
const pack = (u) => ({ _id: u._id, name: u.name, email: u.email, phone: u.phone, role: u.role, token: sign(u._id) });

router.post('/register', async (req, res, next) => {
  try {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Name, email and password are required' });
    if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });
    if (await User.findOne({ email: email.toLowerCase() })) {
      return res.status(400).json({ message: 'This email is already registered' });
    }
    // role is always customer; admins are created only by the seed
    const user = await User.create({ name, email, phone, password, role: 'customer' });
    res.status(201).json(pack(user));
  } catch (e) {
    next(e);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: (email || '').toLowerCase() });
    if (!user || !(await user.matchPassword(password || ''))) {
      return res.status(401).json({ message: 'Incorrect email or password' });
    }
    res.json(pack(user));
  } catch (e) {
    next(e);
  }
});

router.get('/me', protect, (req, res) => res.json(req.user));

module.exports = router;
