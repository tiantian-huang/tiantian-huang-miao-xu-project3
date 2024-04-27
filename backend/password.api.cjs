const express = require('express');
const router = express.Router();
const passwordModel = require('./db/password.model.cjs');
const shareRequestModel = require('./db/shareRequest.model.cjs');
const cookieHelper = require('./cookie.helper.cjs');
const userModel = require('./db/user.model.cjs');
const { findPasswords } = require('./db/password.model.cjs');

// Adding a password
router.post('/', async function(request, response) {
    const username = cookieHelper.cookieDecryptor(request);
    if (!username) {
        return response.status(401).send('Unauthorized access.');
    }
    const { url, password } = request.body;
    try {
        const newPassword = { username, url, password, updatedAt: new Date() };
        await passwordModel.insertPassword(newPassword);
        response.status(201).send('Password added successfully.');
    } catch (error) {
        response.status(500).send(`Failed to add password: ${error.message}`);
    }
});

// Getting all passwords for a user, including those shared with them
router.get('/:username', async function(request, response) {
    const username = request.params.username;
    try {
        // Fetch passwords where the user is the owner or is listed in sharedUsers
        const passwords = await passwordModel.findPasswords({
            $or: [
                { username: username },
                { sharedUsers: username }
            ]
        });
        response.send({ passwords });
    } catch (error) {
        response.status(500).send(`Failed to retrieve passwords: ${error.message}`);
    }
});

// Updating a password
router.put('/:id', async function(request, response) {
    const id = request.params.id;
    const { url, password } = request.body;
    try {
        await passwordModel.updatePassword(id, { url, password, updatedAt: new Date() });
        response.send('Password updated successfully.');
    } catch (error) {
        response.status(500).send(`Failed to update password: ${error.message}`);
    }
});

// Deleting a password
router.delete('/:id', async function(request, response) {
    const id = request.params.id;
    try {
        await passwordModel.deletePassword(id);
        response.send('Password deleted successfully.');
    } catch (error) {
        response.status(500).send(`Failed to delete password: ${error.message}`);
    }
});

// Sharing all passwords from one user to another
router.post('/share', async function(request, response) {
    const { targetUsername } = request.body;
    const username = cookieHelper.cookieDecryptor(request);

    const targetUser = await userModel.getUserByUsername(targetUsername);
    if (!targetUser) {
        return response.status(404).send('Target username does not exist.');
    }
    if (username === targetUsername) {
        return response.status(400).send("Cannot share password with yourself.");
    }

    try {
        const newShareRequest = await shareRequestModel.createShareRequest({
            requester: username,
            target: targetUsername,
            status: 'pending'
        });
        response.status(200).send(`Share request sent to ${targetUsername}`);
    } catch (error) {
        console.error('Failed to create share request:', error);
        response.status(500).send(`Failed to send share request: ${error.message}`);
    }
});

router.post('/accept-share/:requestId', async (req, res) => {
    const requestId = req.params.requestId;
    try {
        const shareRequest = await shareRequestModel.findById(requestId);
        if (!shareRequest || shareRequest.status !== 'pending') {
            return res.status(404).send('Invalid or already processed request.');
        }

        // Update sharedUsers in all passwords owned by the requester
        await passwordModel.updateMany(
            { username: shareRequest.requester },
            { $addToSet: { sharedUsers: shareRequest.target } }
        );

        await shareRequestModel.updateShareRequest(requestId, { status: 'accepted' });
        res.send('Share request accepted.');
    } catch (error) {
        res.status(500).send('Error processing request: ' + error.message);
    }
});

router.post('/reject-share/:requestId', async (req, res) => {
    const requestId = req.params.requestId;
    try {
        await shareRequestModel.updateShareRequest(requestId, { status: 'rejected' });
        res.send('Share request rejected.');
    } catch (error) {
        res.status(500).send('Error processing request: ' + error.message);
    }
});

router.get('/share-requests/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const shareRequests = await shareRequestModel.findShareRequest({ target: username, status: 'pending' }); 
        res.json(shareRequests);
    } catch (error) {
        res.status(500).send('Failed to get share requests'+ error.message);
    }
});


router.get('/shared-with/:username', async (req, res) => {
    const { username } = req.params;
    try {
        const sharedPasswords = await findPasswords({ sharedUsers: username });
        res.json(sharedPasswords);
    } catch (error) {
        res.status(500).send(`Failed to retrieve shared passwords: ${error.message}`);
    }
});

module.exports = router;
