const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () =>{

    try{
        
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log('DB connected succesfully');
    }catch(err){

        console.error(`error while connecting the DB`, err.message);
        process.exit(1);
    }
};


module.exports = connectDB;