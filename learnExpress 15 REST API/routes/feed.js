const express = require("express");
const feedController = require("../controllers/feed"); // controller methods
const { body } = require("express-validator"); // for in-server validation
const isAuth = require("../middleware/is-auth"); // middleware to handle authorization, use this in routes

const router = express(); // create router

router.get("/posts", isAuth, feedController.getPosts); // in order to rich this route register in app.js

router.post(
  "/post",
  [
    // for adding post
    body("title").trim().isLength({ min: 5 }),
    body("content").trim().isLength({ min: 5 }),
  ],
  isAuth,
  feedController.createPost
);

router.get("/post/:postId", isAuth, feedController.getPost); // for displaying single post with given id

router.put(
  "/post/:postId",
  [
    // for adding post
    body("title").trim().isLength({ min: 5 }),
    body("content").trim().isLength({ min: 5 }),
  ],
  isAuth,
  feedController.updatePost
); // for updating a post

router.delete("/post/:postId", isAuth, feedController.deletePost);

module.exports = router;
