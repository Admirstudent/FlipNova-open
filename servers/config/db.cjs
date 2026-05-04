const mongoose = require("mongoose");
const { MONGO_URI, DB_NAME } = require("./index.cjs");

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI, { dbName: DB_NAME });
    console.log(`MongoDB connected -> ${DB_NAME}`);
  } catch (err) {
    console.error("Mongo error:", err);
    process.exit(1);
  }
};

module.exports = connectDB;