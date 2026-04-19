const mongoose = require('mongoose');

const connectDB = async () => {
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/curalink';

  const maskedURI = MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '// $1:****@');
  console.log(`Attempting to connect to: ${maskedURI}`);

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB successfully');
    return true;
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    return false;
  }
};

module.exports = connectDB;
