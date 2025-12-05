const mongoose = require("mongoose");
const config = require("./config.json");

const connectDB = async () => {
  try {
    console.log("connecting.............")
    await mongoose.connect(config.mongoURI);

    console.log()

    console.log("✅ MongoDB Connected");
  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
