const mongoose = require('mongoose');
const validator = require('validator');

const productSchema = mongoose.Schema({
    seller: {
        type: mongoose.Schema.ObjectId,
        required: [true, "Product must have a seller"]
    },
    name: {
        type: String,
        required: [true, "Please provide a valid name"]
    },
    description: {
        type: String
    },
    price: {
        type: Number,
        required: [true, "Please provide a valid price"],
        min: 1
    },
    availableQuantity: {
        type: Number,
        required: [true, "Please provide valid quantity"],
        validate: {
            validator: function (value) {
                return value >= 0;
            },
            message: "Quantity must not be less than 0"
        }
    }
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;