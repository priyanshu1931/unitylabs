const Product = require("./../models/Product");
const Order = require("./../models/Order");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");

module.exports.getOrders = catchAsync(async function (req, res, next) {
    const orders = await Order.find({ seller: req.user._id }).populate('items');
    res.status(200).json({
        status: 'success',
        length: orders.length,
        data: {
            orders
        }
    })
})

module.exports.createCatalog = catchAsync(async function (req, res, next) {
    const products = req.body.products;
    if (!Array.isArray(products) || products.length === 0) {
        return next(new AppError('Invalid or empty products array.', 400));
    }
    const createdProducts = [];
    const failedProducts = [];
    await Promise.all(products.map(async product => {
        try {
            const p = await Product.create({ ...product, seller: req.user._id })
            createdProducts.push(p);
            req.user.catalog.push(p);
        } catch (err) {
            failedProducts.push({
                product,
                error: err.message
            });
        }
    }));
    await req.user.save();
    res.status(201).json({
        status: 'success',
        created: createdProducts,
        failed: failedProducts
    });
})