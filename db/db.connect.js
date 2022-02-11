const mongoose = require("mongoose");
const MONGO_PASSWORD = process.env['MONGO_PASSWORD'];


const URL = `mongodb+srv://MadhushreeKunder:${MONGO_PASSWORD}@coral-gram.cf8p0.mongodb.net/social-media-info?retryWrites=true&w=majority`

async function initialiseDBConnection(){
  try {
    const connection = await mongoose.connect(URL, {
     useUnifiedTopology: true,
     useNewUrlParser: true,
        })
        if(connection){
          console.log("successfully connected")
        }
      }
catch(error){
  (error => console.error("mongoose connection failed", error))
  }
}

module.exports = {initialiseDBConnection}