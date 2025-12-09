const express = require('express');
const mongoose = require('mongoose');

const app = express();

app.use(express.json());

mongoose.connect('mongodb://127.0.0.1:27017/immobook_db')
    .then(() =>  console.log("connected to mongodb"))
    .catch(err => console.log(err))

const authRoutes = require('./routes/authRoutes');
app.use(authRoutes);

app.listen(3000, () => {
    console.log('server runs on port 3000');
})