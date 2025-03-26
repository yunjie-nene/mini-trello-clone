function connectDB() {
  const mongoose = require("mongoose");
  const dotenv = require("dotenv");
  dotenv.config();

  const CONNECTION_STRING = process.env.MONGO_URI;

  mongoose
    .connect(CONNECTION_STRING)
    .then(() => console.log("MongoDB connected successfully"))
    .catch((err: unknown) => console.error("MongoDB connection error:", err));
}

export default connectDB;
