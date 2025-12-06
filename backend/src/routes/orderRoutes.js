const express = require('express');
const {
  getAllOrders,
  getOrder,
  createOrder,
  updateOrderStatus,
  updatePaymentStatus,
  deleteOrder,
  getOrderStats,
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Protect all routes
router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getOrderStats);
router.route('/').get(getAllOrders).post(createOrder);
router.route('/:id').get(getOrder).delete(deleteOrder);
router.put('/:id/status', updateOrderStatus);
router.put('/:id/payment', updatePaymentStatus);

module.exports = router;
