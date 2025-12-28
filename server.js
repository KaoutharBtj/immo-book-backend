const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors')
require ('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.urlencoded({extended: true}))
app.use('/api/v1/auth', require('./routes/authRoutes'));
app.use('/api/v1/projets', require ('./routes/promoProjectsRoutes'));
app.use('/api/v1//uploads', express.static('uploads'));

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