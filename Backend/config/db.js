const mongoose = require("mongoose");
require('dotenv').config()
const connection = process.env.MongoDb_database;


const connect_db = async () =>{

    try {
          await mongoose.connect(connection);
          console.log("Connection Successfull!");
    } catch(e){
        console.log("Mongodb connection error",e);
        process.exit(1);
    }

}

module.exports = connect_db;