const mongoose = require('mongoose');

const PasswordSchema = new mongoose.Schema({
    url: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    username: { // 密码的拥有者
        type: String,
        required: true
    },
    sharedUsers: [{
        type: String
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, { collection: 'passwords' });

module.exports = PasswordSchema;
