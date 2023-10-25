const jwt = require('jsonwebtoken')
const catchAsync = require('./../utils/catchAsync');
const Buyer = require('./../models/Buyer');
const Seller = require('./../models/Seller');
const AppError = require('./../utils/appError');

module.exports.isAuthenticated = catchAsync(async function (req, res, next) {

    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    else if (req.headers.cookie) {
        token = req.headers.cookie.substr(4);
    }
    else {
        return next(
            new AppError('You are not logged in! Please log in to get access.', 401)
        );
    }

    const decoded = await jwt.verify(token, process.env.JWT_SECRET);
    const type = decoded.type;
    let Model;
    if (type === 'seller') Model = Seller;
    else if (type === 'buyer') Model = Buyer;
    else return next(
        new AppError('Invalid user type.', 401)
    );
    const currentUser = await Model.findById(decoded._id);
    if (!currentUser) {
        return next(
            new AppError(
                'The user belonging to this token does no longer exist.',
                401
            )
        );
    }

    req.user = currentUser;
    next();
})

module.exports.restrictTo = (role) => {
    return (req, res, next) => {
        if (role !== req.user.type) {
            return next(
                new AppError('You do not have permission to perform this action', 403)
            );
        }
        next();
    };
};