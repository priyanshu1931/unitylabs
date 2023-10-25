const Order = require('./../models/Order');
const Buyer = require('./../models/Buyer');
const Product = require('./../models/Product');
const Seller = require('./../models/Seller');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

module.exports.getListOfSellers = catchAsync(async function (req, res, next) {
    const sellers = await Seller.find().select('name');
    res.status(200).json({
        status: 'success',
        length: sellers.length,
        data: {
            sellers
        }
    })
})

module.exports.getSellerCatalog = catchAsync(async function (req, res, next) {
    const seller_id = req.params.seller_id;
    const seller = await Seller.findById(seller_id).select('name catalog').populate('catalog');
    res.status(200).json({
        status: 'success',
        data: {
            seller
        }
    })
})

module.exports.createOrder = catchAsync(async function (req, res, next) {
    const items = req.body.items;
    if (!Array.isArray(items) || items.length === 0) {
        return next(new AppError('Invalid or empty items array.', 400));
    }
    const purchased_items = [];
    const failed_items = [];
    let totalAmount = 0;

    await Promise.all(items.map(async item => {
        try {
            const p = await Product.findById(item);
            if (p) {
                if (p.availableQuantity > 0) {
                    purchased_items.push(p);
                    totalAmount += p.price;
                } else {
                    throw new Error('This product is out of stock.');
                }
            } else {
                throw new Error('This product does not exist.');
            }
        } catch (err) {
            failed_items.push({
                item,
                error: err.message
            });
        }
    }));

    if (totalAmount) {
        const order = {
            buyer: req.user._id,
            seller: req.params.seller_id,
            items: purchased_items,
            totalAmount: totalAmount,
            details: req.body.details
        };

        Order
            .create(order)
            .then(newOrder => {
                req.user.orders.push(newOrder);
                return Promise.all(
                    purchased_items.map(async item => {
                        item.availableQuantity -= 1;
                        return item.save();
                    })
                );
            })
            .then(() => {
                return req.user.save();
            })
            .then(() => {
                return Buyer.findById(req.user._id).populate('orders');
            })
            .then(user => {
                res.status(201).json({
                    status: 'success',
                    message: 'Order placed successfully',
                    data: {
                        user: user
                    },
                });
            })
            .catch(error => {
                return next(new AppError(error.message, 400));
            });
    } else {
        return next(new AppError('There was some error placing your order', 400));
    }
});