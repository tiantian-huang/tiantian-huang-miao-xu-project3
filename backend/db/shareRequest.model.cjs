// shareRequest.model.cjs
const mongoose = require('mongoose');

// Define the schema for a share request
const shareRequestSchema = new mongoose.Schema({
    requester: { type: String, required: true },  // 发起分享的用户
    target: { type: String, required: true },     // 目标用户
    status: { type: String, default: 'pending', enum: ['pending', 'accepted', 'rejected'] },  // 请求状态
    createdAt: { type: Date, default: Date.now }
}, { collection: 'shareRequests' });

// Create the model from the schema
const ShareRequestModel = mongoose.model('ShareRequest', shareRequestSchema);

// Expose the model and CRUD operations
module.exports = {
    createShareRequest: (data) => ShareRequestModel.create(data),
    updateShareRequest: (id, updateData) => ShareRequestModel.findByIdAndUpdate(id, updateData, { new: true }).exec(),
    findShareRequest: (query) => ShareRequestModel.find(query).exec(),
    findById: (id) => ShareRequestModel.findById(id).exec()
};
