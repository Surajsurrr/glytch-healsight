const Product = require('../models/Product');
const Order = require('../models/Order');

// @desc Public - Get active products (with simple search)
// @route GET /api/v1/products
// @access Public
const getPublicProducts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const category = req.query.category || '';

    const query = { status: 'active' };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    if (category) query.category = category;

    const products = await Product.find(query).select('name price images category stock description tags').limit(limit).skip(skip);
    const total = await Product.countDocuments(query);

    res.status(200).json({ success: true, data: products, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    next(error);
  }
};

// @desc Public - Get single product
// @route GET /api/v1/products/:id
// @access Public
const getPublicProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).select('-__v');
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

// @desc Public - Recommend products by disease keywords (simple text match)
// @route POST /api/v1/products/recommend/disease
// @access Public
const recommendByDisease = async (req, res, next) => {
  try {
    const { disease } = req.body;
    if (!disease) return res.status(400).json({ success: false, message: 'Disease input required' });

    const keywords = disease.split(/[,\s]+/).filter(Boolean).slice(0, 8).map(k => k.trim());
    // Search products by name, description, tags
    const regexes = keywords.map(k => new RegExp(k, 'i'));
    const products = await Product.find({ status: 'active', $or: [ { name: { $in: regexes } }, { description: { $in: regexes } }, { tags: { $in: regexes } } ] }).limit(20);

    // Score by matches (simple heuristic)
    const scored = products.map(p => {
      let score = 0;
      keywords.forEach(k => {
        const re = new RegExp(k, 'i');
        if (re.test(p.name)) score += 3;
        if (re.test(p.description)) score += 2;
        if ((p.tags || []).some(t => re.test(t))) score += 2;
      });
      return { product: p, score };
    });

    scored.sort((a,b) => b.score - a.score);
    res.status(200).json({ success: true, data: scored.slice(0, 10).map(s => s.product) });
  } catch (error) {
    next(error);
  }
};

// @desc Protected - Personalized frequent buys based on user's orders
// @route GET /api/v1/products/recommend/personalized
// @access Private (user)
const recommendPersonalized = async (req, res, next) => {
  try {
    const userId = req.user && req.user.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const userOrders = await Order.find({ patient: userId }).select('items');
    const freq = {};
    userOrders.forEach(o => {
      (o.items || []).forEach(it => {
        const pid = String(it.product);
        freq[pid] = (freq[pid] || 0) + (it.quantity || 1);
      });
    });

    const productIds = Object.keys(freq);
    if (productIds.length === 0) {
      // Fallback: top selling products
      const top = await Product.find({ status: 'active' }).sort('-soldCount').limit(8).select('name price images');
      return res.status(200).json({ success: true, data: top });
    }

    // Get product documents and sort by frequency
    const products = await Product.find({ _id: { $in: productIds } }).select('name price images');
    products.sort((a,b) => (freq[String(b._id)] || 0) - (freq[String(a._id)] || 0));

    res.status(200).json({ success: true, data: products.slice(0, 10) });
  } catch (error) {
    next(error);
  }
};

module.exports = { getPublicProducts, getPublicProduct, recommendByDisease, recommendPersonalized };

