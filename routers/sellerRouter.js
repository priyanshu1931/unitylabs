const { createCatalog, getOrders } = require('../controllers/sellerController');
const { isAuthenticated, restrictTo } = require('../middlewares/auth');

const router = require('express').Router();

router.use(isAuthenticated, restrictTo('seller'));

router.get('/orders', getOrders);

router.post('/create-catalog', createCatalog);

module.exports = router;