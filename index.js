const express = require("express");
const app = express();

// Initialize the body parse middleware
app.use(express.urlencoded({ extended: false })); // handle form submission
app.use(express.json()); // handle raw json

require("./config/database/database");

app.get('/', (req, res) => {
  res.send('<h1>Hello world</h1>');
}),

app.use("/admin", require("./routes/admin"));
app.use("/users", require("./routes/users"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server Running on PORT ${PORT}...`);
});
