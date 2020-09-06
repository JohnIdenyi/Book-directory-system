const mongoose = require("mongoose");

// admin schema
const adminSchema = mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);
let Admin = (module.exports = mongoose.model("Admin", adminSchema));
