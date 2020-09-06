const mongoose = require("mongoose");

// connect to mongo DB
mongoose.connect("mongodb://localhost:27017/johnEjima", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
var db = mongoose.connection;
// check for db errors
db.on("error", (err) => {
  console.log(err);
});
// check connection
db.once("open", () => {
  console.log("MongoDB Connected Successfully!");
});

module.exports = mongoose;
