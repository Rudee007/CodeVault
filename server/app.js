const express = require('express');
const cors = require('cors');
const connectDB = require("./config/db");
const app = express();


const authRoutes =  require('./routes/authRoutes');

app.use(cors({
    origin: 'http://localhost:3003',
    methods: ['GET','POST','PUT','DELETE'],
}));


app.use(express.json())
app.use('/api/auth', authRoutes);
connectDB();
const PORT = 3003

app.listen(PORT, () => {

    console.log(`server is running on port ${PORT}`);
});