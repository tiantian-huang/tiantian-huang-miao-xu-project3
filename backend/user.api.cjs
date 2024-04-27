const cookieHelper = require('./cookie.helper.cjs');
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const router = express.Router();
const userModel = require('./db/user.model.cjs');

router.post('/register', async function(request, response) {
    const { username, password } = request.body;

    try {
        const existingUser = await userModel.getUserByUsername(username);
        if (existingUser) {
            return response.status(400).send('Username already exists');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = { username, password: hashedPassword };
        await userModel.insertUser(newUser);

        const token = jwt.sign({ username }, 'POKEMON_SECRET', { expiresIn: '14d' });
        response.cookie('token', token, { httpOnly: true });

        return response.status(201).send('User with username ' + username + ' created.');
    } catch (error) {
        if (error.code === 11000) {
            return response.status(400).send('Username already exists');
        }
        response.status(500).send('Failed to create user: ' + error.message);
    }
});



router.post('/login', async function(request, response) {
    const { username, password } = request.body;

    try {
        const user = await userModel.getUserByUsername(username);
        if (!user) {
            return response.status(404).send('No user found.');
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return response.status(400).send('Passwords do not match.');
        }

        const token = jwt.sign({ username }, 'POKEMON_SECRET', { expiresIn: '14d' });
        response.cookie('token', token, { httpOnly: true });

        return response.send('Logged in!');
    } catch (error) {
        response.status(500).send('Failed to login: ' + error.message);
    }
});

router.get('/loggedIn', function(request, response) {
    const username = cookieHelper.cookieDecryptor(request);
    if (username) {
        return response.send({ username });
    } else {
        return response.status(401).send('Not logged in');
    }
});

router.post('/logout', function(request, response) {
    response.clearCookie('token');
    return response.send('Logged out');
});

module.exports = router;
