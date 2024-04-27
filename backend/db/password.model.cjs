const mongoose = require('mongoose');
const PasswordSchema = require('./password.schema.cjs');

const PasswordModel = mongoose.model('Password', PasswordSchema);

function insertPassword(passwordData) {
    return PasswordModel.create(passwordData);
}

function getPasswordsByUsername(username) {
    return PasswordModel.find({ username }).exec();
}

function updatePassword(id, newPasswordData) {
    return PasswordModel.findByIdAndUpdate(id, newPasswordData, { new: true }).exec();
}

function deletePassword(id) {
    return PasswordModel.findByIdAndDelete(id).exec();
}

// Adding the updateMany function
function updateMany(filter, update) {
    return PasswordModel.updateMany(filter, update).exec();
}
function findPasswords(query) {
    return PasswordModel.find(query).exec();
}


module.exports = {
    insertPassword,
    getPasswordsByUsername,
    updatePassword,
    deletePassword,
    updateMany, // expose updateMany
    findPasswords
};
