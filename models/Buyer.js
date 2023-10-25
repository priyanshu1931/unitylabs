const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');

const buyerSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please provide a valid name"]
    },
    email: {
        type: String,
        required: [true, "Please provide a valid email"],
        unique: true,
        lowercase: true,
        index: true,
        validate: [validator.isEmail, 'Please provide a valid email']
    },
    password: {
        type: String,
        required: [true, "Please provide a valid password"],
        minlength: 8,
        select: false
    },
    type: {
        type: String,
        required: true,
        default: 'buyer',
        immutable: true
    },
    orders: [{
        type: mongoose.Schema.ObjectId,
        ref: 'Order'
    }]
})

buyerSchema.pre('save', async function (next) {
    // Only run this function if password was actually modified
    if (!this.isModified('password')) return next();

    // Hash the password with cost of 12
    this.password = await bcrypt.hash(this.password, 12);
    next();
})

buyerSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
}

const Buyer = mongoose.model('Buyer', buyerSchema);

module.exports = Buyer;