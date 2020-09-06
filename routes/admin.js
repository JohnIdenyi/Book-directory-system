const express = require("express");
const { check, validationResult } = require("express-validator");
const router = express.Router();

// bring in the models
const Admin = require("../models/Admin");
const Book = require("../models/Book");

// Access control to make sure admin is authenticated
// to do some stuff. A middleware
const isAuthenticated = (req, res, next) => {
  let query = { username: req.body.username, password: req.body.password };
  Admin.findOne(query, (err, admin) => {
    if (err) {
      res.status(200).json({ isCompleted: false, msg: err });
    }
    if (!admin) {
      res.status(200).json({
        isCompleted: false,
        msg: "Invalid Username or password!",
      });
    } else {
      return next();
    }
  });
};

// fetch all the books
router
  .route("/books")
  .post(
    [
      check("username")
        .not()
        .isEmpty()
        .trim()
        .withMessage("Username is Required!"),
      check("password").not().isEmpty().withMessage("Password is Required!"),
      check("password")
        .isLength({ min: 5 })
        .withMessage("Password must be greater than or equal to 5 characters!"),
    ],
    isAuthenticated,
    (req, res) => {
      // Check Errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(200).json({ isCompleted: false, msg: errors.array() });
      } else {
        Book.find()
          .then((books) => {
            res.status(200).json({
              isCompleted: true,
              books,
            });
          })
          .catch((err) => {
            res.status(200).json({
              isCompleted: false,
              msg: err,
            });
          });
      }
    }
  );

// add a book
router
  .route("/books/add")
  .post(
    [
      check("title")
        .not()
        .isEmpty()
        .trim()
        .withMessage("Book Title is Required!"),
      check("countLeft").not().isEmpty().withMessage("Book Count is Required!"),
      check("countLeft")
        .isNumeric()
        .withMessage("Book Count should be a Number!"),
      check("username")
        .not()
        .isEmpty()
        .trim()
        .withMessage("Username is Required!"),
      check("password").not().isEmpty().withMessage("Password is Required!"),
      check("password")
        .isLength({ min: 5 })
        .withMessage("Password must be greater than or equal to 5 characters!"),
    ],
    isAuthenticated,
    (req, res) => {
      // Check Errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(200).json({ isCompleted: false, msg: errors.array() });
      } else {
        let book = new Book({
          title: req.body.title,
          countLeft: req.body.countLeft,
        });
        book
          .save()
          .then(() => {
            res.status(200).json({
              isCompleted: true,
              msg: "Book Added Successfully!",
            });
          })
          .catch((err) => {
            res.status(200).json({
              isCompleted: false,
              msg: err,
            });
          });
      }
    }
  );

// register the admin
router.route("/register").post((req, res) => {
  let admin = new Admin({ username: "admin", password: "admin" });
  admin
    .save()
    .then(() => {
      res.status(200).json({
        isCompleted: true,
        msg: "Registration Successful!",
      });
    })
    .catch((err) => {
      res.status(200).json({
        isCompleted: false,
        msg: err,
      });
    });
});

module.exports = router;
