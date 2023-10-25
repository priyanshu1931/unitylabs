const jwt = require('jsonwebtoken');
const catchAsync = require('./../utils/catchAsync');
const Buyer = require('./../models/Buyer');
const Seller = require('./../models/Seller');
const AppError = require('./../utils/appError');

const signToken = data => {
    return jwt.sign(data, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
};

const createSendToken = (user, statusCode, req, res) => {
    const token = signToken({ _id: user._id, type: user.type });

    res.cookie('jwt', token, {
        expires: Date.now() + process.env.JWT_COOKIE_EXPIRES_IN,
        httpOnly: true,
        secure: req.secure || req.headers['x-forwarded-proto'] === 'https'
    });

    // Remove password from output
    delete user.password;

    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user
        }
    });
};

module.exports.registerUser = catchAsync(async function (req, res, next) {
    const user = { name, email, password } = req.body;
    let newUser
    if (req.body.type === 'seller') {
        newUser = await Seller.create(user);
    }
    else if (req.body.type === 'buyer') {
        newUser = await Buyer.create(user);
    }
    else {
        return next(new AppError('Please provide a valid user type', 400));
    }
    res.status(201).json({
        status: 'success',
        message: 'User successfully registered',
        user: newUser
    })
})

module.exports.loginUser = catchAsync(async function (req, res, next) {
    const { email, password, type } = req.body;

    let Model;
    if (type === 'buyer') Model = Buyer;
    else if (type === 'seller') Model = Seller;
    else return next(new AppError('Please provide a valid user type', 400));

    // 1) Check if email and password exist
    if (!email || !password) {
        return next(new AppError('Please provide email and password!', 400));
    }
    // 2) Check if user exists && password is correct
    const populateField = Model === Buyer ? 'orders' : 'catalog';
    const user = await Model.findOne({ email }).select('+password').populate(populateField);

    if (!user || !(await user.comparePassword(password))) {
        return next(new AppError('Incorrect email or password', 401));
    }

    createSendToken(user, 200, req, res);
})