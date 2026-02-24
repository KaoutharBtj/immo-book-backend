const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors')
require ('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/v1/auth', require('./routes/authRoutes'));
app.use('/api/v1/projets', require ('./routes/promoProjectsRoutes'));
app.use('/uploads', express.static( './uploads'));
app.use('/api/v1/client-projects', require('./routes/clientProjectRoutes'));
app.use('/api/v1/reservations', require('./routes/reservationRoutes'));
app.use('/api/v1/reviews', require('./routes/reviewRoutes'));
app.use('/api/v1/favoris', require('./routes/favorisRoutes'));


app.use((req, res) => {
    res.status(404).json({
        succes: false,
        message: 'Route non trouvée'
    })
})
mongoose.connect(process.env.MONGO_URI)
    .then(() =>  console.log("connected to mongodb"))
    .catch(err => console.log(err))

app.listen(process.env.PORT, () => {
    console.log(`server runs on port ${process.env.PORT}`);
})