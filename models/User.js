const mongoose = require("mongoose");

// user schema
const userSchema = mongoose.Schema(
  {
    firstname: {
      type: String,
      required: true,
    },
    lastname: {
      type: String,
      required: true,
    },
    libraryID: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    // one to many relationship with books
    books: [{ type: mongoose.Schema.Types.ObjectId, ref: "Book", default: [] }],
  },
  { timestamps: true }
);
let User = (module.exports = mongoose.model("User", userSchema));
