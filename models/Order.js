const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({
    buyer: {
        type: mongoose.Schema.ObjectId,
        required: [true, "Order must have a buyer"],
        ref: 'Buyer'
    },
    seller: {
        type: mongoose.Schema.ObjectId,
        required: [true, "Order must have a seller"],
        ref: 'Seller'
    },
    items: [{
        type: mongoose.Schema.ObjectId,
        ref: 'Product'
    }],
    totalAmount: {
        type: Number,
        default: 0
    },
    details: {
        contact: {
            type: String,
            required: [true, "Please provide a valid contact number"],
            validate: {
                validator: function (value) {
                    // Check if the value is a valid 10-digit number starting with 6, 7, 8, or 9
                    return /^[6-9]\d{9}$/.test(value);
                },
                message: 'Mobile number is not valid.'
            }
        },
        address: {
            type: String,
            required: [true, "Please provide a valid address"]
        },
        pincode: {
            type: Number,
            min: 100000,
            max: 999999
        },
        city: {
            type: String,
            required: [true, "Please provide a valid city"]
        },
        state: {
            type: String,
            required: [true, "Please provide a valid state"]
        }
    }
}, { timestamps: true });

// Add a custom validator to ensure there's at least one item in the items array
orderSchema.path('items').validate(function (value) {
    return value.length > 0;
}, 'Order must have at least one item');

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;