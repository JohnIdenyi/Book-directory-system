const mongoose = require("mongoose");

// books schema
const bookSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    countLeft: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);
let Book = (module.exports = mongoose.model("Book", bookSchema));
