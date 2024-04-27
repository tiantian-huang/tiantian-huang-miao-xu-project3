const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const path = require('path');
const users = require('./backend/user.api.cjs');
const passwords = require('./backend/password.api.cjs');

const app = express();

const mongoDBEndpoint = 'mongodb+srv://amyhtt:940430@cluster0.jstnczz.mongodb.net/?retryWrites=true&appName=Cluster0';
mongoose.connect(mongoDBEndpoint);

mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/users', users);
app.use('/api/passwords', passwords);

let frontend_dir = path.join(__dirname, 'dist');
app.use(express.static(frontend_dir));
app.get('*', (req, res) => {
    res.sendFile(path.join(frontend_dir, "index.html"));
});

const port = process.env.PORT || 8000;
app.listen(port, () => {
    console.log("Server is running...");
});

