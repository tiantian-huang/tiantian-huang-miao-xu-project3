const jwt = require('jsonwebtoken');

function cookieDecryptor(request) {
    const token = request.cookies['token'];
    if (!token) {
        return null;
    }
    try {
        const decoded = jwt.verify(token, 'POKEMON_SECRET');
        return decoded.username;
    } catch (error) {
        console.log('Error decoding token: ', error);
        return null;
    }
}

module.exports = {
    cookieDecryptor
};
