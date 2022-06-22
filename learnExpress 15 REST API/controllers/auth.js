const User = require("../models/user");
const { validationResult } = require("express-validator/check"); // for getting errors
const bcrypt = require("bcryptjs"); // for hashing password
const jwt = require("jsonwebtoken"); // for generation authentication tokens
const { load } = require("nodemon/lib/rules");

exports.signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // checking for errors
    const error = new Error("Validation failed");
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }
  const email = req.body.email; // comes from front
  const name = req.body.name;
  const password = req.body.password;

  try {
    const hashedPass = await bcrypt.hash(password, 12);
    const user = new User({
      // create an instance of User model
      email: email,
      name: name,
      password: hashedPass,
    });

    await user.save(); // save in db

    res.status(201).json({
      // if user added in db this will go to front
      message: "User Created",
      userId: user._id,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500; // server error
    }
    next();
  }
};

exports.login = async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  let loadedUser;

  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      const error = new Error("USer is not found");
      error.statusCode = 401;
      throw error;
    }
    loadedUser = user;
    const isEqual = await bcrypt.compare(password, user.password);
    if (!isEqual) {
      const error = new Error("provided password is incorrect");
      error.statusCode = 401;
      throw error;
    }
    const token = jwt.sign(
      {
        email: loadedUser.email,
        userId: loadedUser._id,
      },
      "someSuperSecretString",
      { expiresIn: "1h" }
    );
    res.status(200).json({ token: token, userId: loadedUser._id.toString() }); // in front we use this id, also after 1h it will log out
    return; // implicitly returns the promise hidden behind the async and await. success case
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
    return err; // implicitly returns the promise hidden behind the async and await. error case
  }
};

exports.getUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({ status: user.status });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.updateUserStatus = async (req, res, next) => {
  const newStatus = req.body.status;
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      const error = new Error("User not found Man yo");
      error.statusCode = 404;
      throw error;
    }
    user.status = newStatus;
    await user.save();
    res.status(200).json({ message: "USer updated" });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
