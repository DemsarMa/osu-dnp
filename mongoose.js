const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: "./.env" });
const connUri = process.env.MONGO_URI;

mongoose.connect(connUri, { useNewUrlParser: true });
const db_connection = mongoose.connection;
console.log(db_connection);
db_connection.on("open", () => {
  console.log("Connected correctly to MongoDB server");
});

module.exports = mongoose;
