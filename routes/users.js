const express = require("express");
const uuid = require("uuid");
const { check, validationResult } = require("express-validator");
const router = express.Router();

// bring in the models
const User = require("../models/User");
const Book = require("../models/Book");

// Access control to make sure admin is authenticated
// to do some stuff. A middleware
const isAuthenticated = (req, res, next) => {
  let query = { libraryID: req.body.libraryID, password: req.body.password };
  User.findOne(query, (err, user) => {
    if (err) {
      res.status(200).json({ isCompleted: false, msg: err });
    }
    if (!user) {
      res.status(200).json({
        isCompleted: false,
        msg: "Invalid LibraryID or Password!",
      });
    } else {
      return next();
    }
  });
};

// fetch all the users
router.route("/").get((req, res) => {
  User.find()
    .then((users) => {
      res.status(200).json({
        isCompleted: true,
        users,
      });
    })
    .catch((err) => {
      res.status(200).json({
        isCompleted: false,
        msg: err,
      });
    });
});

// fetch all the books
router
  .route("/books")
  .post(
    [
      check("libraryID")
        .not()
        .isEmpty()
        .trim()
        .withMessage("LibraryID is Required!"),
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

// borrow a book
router
  .route("/books/borrow/:id")
  .post(
    [
      check("libraryID")
        .not()
        .isEmpty()
        .trim()
        .withMessage("LibraryID is Required!"),
      check("password").not().isEmpty().withMessage("Password is Required!"),
      check("password")
        .isLength({ min: 5 })
        .withMessage("Password must be greater than or equal to 5 characters!"),
    ],
    isAuthenticated,
    (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(200).json({ isCompleted: false, msg: errors.array() });
      } else {
        const id = req.params.id; // id of the book to be borrowed
        const libraryID = req.body.libraryID; // libraryID of the user
        // find the book by the id
        Book.findById(id)
          .then((book) => {
            if (!book.countLeft > 0) {
              // book count is 0
              res.status(200).json({
                isCompleted: false,
                msg: "Sorry, book is not available in stock for rent!",
              });
            } else {
              // avoid borrowing one book twice
              User.findOne({ libraryID })
                .then((user) => {
                  const borrowedBooks = user.books; // get the books the suer has borrowed
                  // check if the boook to be borrowed is already borrowed by the user
                  const check = borrowedBooks.filter((book) => book == id);
                  if (check.length > 0) {
                    res.status(200).json({
                      isCompleted: false,
                      msg: "Sorry, You have borrowed this book!",
                    });
                  } else {
                    // decrease the count is the book
                    Book.findByIdAndUpdate(
                      id,
                      { countLeft: book.countLeft - 1 },
                      { useFindAndModify: false }
                    )
                      .then(() => {
                        // insert this book into the array of books for this user
                        User.findOne({ libraryID })
                          .then((user) => {
                            user.books.push(id);
                            user.save();
                            res.status(200).json({
                              isCompleted: true,
                              msg: "Book Borrowed Successfully!",
                            });
                          })
                          .catch((err) => {
                            res
                              .status(200)
                              .json({ isCompleted: false, msg: err });
                          });
                      })
                      .catch((err) => {
                        res.status(200).json({ isCompleted: false, msg: err });
                      });
                  }
                })
                .catch((err) => {
                  res.status(200).json({ isCompleted: false, msg: err });
                });
            }
          })
          .catch((err) => {
            res.status(200).json({ isCompleted: false, msg: err });
          });
      }
    }
  );

// return a borrowed book
router
  .route("/books/return/:id")
  .post(
    [
      check("libraryID")
        .not()
        .isEmpty()
        .trim()
        .withMessage("LibraryID is Required!"),
      check("password").not().isEmpty().withMessage("Password is Required!"),
      check("password")
        .isLength({ min: 5 })
        .withMessage("Password must be greater than or equal to 5 characters!"),
    ],
    isAuthenticated,
    (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(200).json({ isCompleted: false, msg: errors.array() });
      } else {
        const libraryID = req.body.libraryID;
        const id = req.params.id; // id of the borrowed book
        User.findOne({ libraryID })
          .then((user) => {
            const borrowedBooks = user.books;
            // check if the boook returned was borrowed by the user
            const check = borrowedBooks.filter((book) => book == id);
            if (check.length > 0) {
              // decrease the count is the book
              Book.findByIdAndUpdate(
                id,
                { $inc: { countLeft: 1 } },
                { useFindAndModify: false }
              )
                .then(() => {
                  // insert this book into the array of books for this user
                  User.findOne({ libraryID })
                    .then((user) => {
                      user.books.pull(id);
                      user.save();
                      res.status(200).json({
                        isCompleted: true,
                        msg: "Book Returned Successfully!",
                      });
                    })
                    .catch((err) => {
                      res.status(200).json({ isCompleted: false, msg: err });
                    });
                })
                .catch((err) => {
                  res.status(200).json({ isCompleted: false, msg: err });
                });
            } else {
              // user did not borrow the book
              res.status(200).json({
                isCompleted: false,
                msg: "Sorry, You did not borrow this book!",
              });
            }
          })
          .catch((err) => {
            res.status(200).json({ isCompleted: false, msg: err });
          });
      }
    }
  );

// user Registration
router
  .route("/register")
  .post(
    [
      check("firstname")
        .not()
        .isEmpty()
        .trim()
        .withMessage("Firstname is Required!"),
      check("lastname")
        .not()
        .isEmpty()
        .trim()
        .withMessage("Lastname is Required!"),
      check("password").not().isEmpty().withMessage("Password is Required!"),
      check("password")
        .isLength({ min: 5 })
        .withMessage("Password must be greater than or equal to 5 characters!"),
    ],
    (req, res) => {
      // Check Errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(200).json({ isCompleted: false, msg: errors.array() });
      } else {
        let user = new User({
          firstname: req.body.firstname,
          lastname: req.body.lastname,
          password: req.body.password,
          libraryID: uuid.v4(),
        });
        user
          .save()
          .then(() => {
            res.status(200).json({
              isCompleted: true,
              msg: "Registration Successful!",
              libraryID: user.libraryID,
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

module.exports = router;
