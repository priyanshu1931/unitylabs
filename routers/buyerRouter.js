const { getListOfSellers, getSellerCatalog, createOrder } = require('../controllers/buyerController');
const { isAuthenticated, restrictTo } = require('../middlewares/auth');

const router = require('express').Router();

router.get('/list-of-sellers', getListOfSellers);

router.get('/seller-catalog/:seller_id', getSellerCatalog);

router.use(isAuthenticated);

router.post('/create-order/:seller_id', restrictTo('buyer'), createOrder);

module.exports = router;