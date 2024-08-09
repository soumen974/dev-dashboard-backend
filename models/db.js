const { MongoClient } = require('mongodb');
require('dotenv').config();


const mongoClient = new MongoClient(process.env.mongo_url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  connectTimeoutMS: 10000,  // 10 seconds
  socketTimeoutMS: 45000, 
});


let mongoDb;
async function connectMongoDB() {
  try {
    await mongoClient.connect();
    mongoDb = mongoClient.db(process.env.DB_NAME);
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('Error connecting to MongoDB', err);
  }
}

// Initialize MongoDB connection
connectMongoDB();

module.exports = mongoDb;
