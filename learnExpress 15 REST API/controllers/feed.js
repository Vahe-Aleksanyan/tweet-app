const fs = require("fs");
const path = require("path");

const { validationResult } = require("express-validator");

const io = require("../socket");
const Post = require("../models/post"); // model of Post in db
const User = require("../models/user");

// we are crating REST API, we send only data to client in the format of json

exports.getPosts = async (req, res, next) => {
  try {
    const currentPage = req.query.page || 1;
    const perPage = 2;
    //let totalItems;
    const totalItems = await Post.find().countDocuments();
    const posts = await Post.find()
      .populate("creator")
      .sort({ createdAt: -1 }) // sorting posts in descending order based on when they were created
      .skip((currentPage - 1) * perPage)
      .limit(perPage);

    res.status(200).json({
      message: "Fetched posts successfully",
      posts: posts,
      totalItems: totalItems,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.createPost = async (req, res, next) => {
  // create post and connect with users
  const errors = validationResult(req); // this brings array of errors
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed"); // when we throw error program tries to find the next controller to handle that error
    error.statusCode = 422;
    throw error; // here throw error but in catch use next(error)
  }
  if (!req.file) {
    // checking if no image given throw error otherwise continue execution
    const error = new Error("No image provided yo");
    error.statusCode = 422;
    throw error;
  }

  const imageUrl = req.file.path;
  const title = req.body.title; // comes for front
  const content = req.body.content;

  const post = new Post({
    // create schema,  create new post
    title: title,
    content: content,
    imageUrl: imageUrl,
    creator: req.userId, // here we pass the id of the user
  });

  try {
    await post.save();

    const user = await User.findById(req.userId);
    user.posts.push(post); // add newly created post in the corresponding user posts field
    const savedUser = await user.save(); // save in database

    // inform all users about new post
    io.getIO().emit("posts", {
      action: "create",
      post: { ...post._doc, creator: { id: req.userId, name: user.name } },
    });

    res.status(201).json({
      // sent info that post was created, about the creator
      // 201 - resource created
      message: "post created successfully",
      post: post,
      creator: { _id: user._id, name: user.name },
    });
    return savedUser; // we are using this in tests
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getPost = async (req, res, next) => {
  const postId = req.params.postId;
  try {
    const post = await Post.findById(postId);
    if (!post) {
      const error = new Error("Could not find post");
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({ message: "Post fetched", post: post });
  } catch (err) {
    console.log(err);
    next(err);
  }
};

exports.updatePost = async (req, res, next) => {
  const postId = req.params.postId; // will be updated based on this id
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed, entered data is incorrect.");
    error.statusCode = 422;
    throw error;
  }
  const title = req.body.title; // new data to be updated
  const content = req.body.content;
  let imageUrl = req.body.image;
  if (req.file) {
    // if new file is uploaded than asiign this new image path
    imageUrl = req.file.path;
  }
  if (!imageUrl) {
    const error = new Error("No file picked.");
    error.statusCode = 422;
    throw error;
  }

  try {
    const post = await Post.findById(postId).populate("creator");
    if (!post) {
      const error = new Error("Could not find post.");
      error.statusCode = 404;
      throw error;
    }
    // we see if the id is the same sa the logged-in user`s id. since ewe populated here we have creator object
    if (post.creator._id.toString() !== req.userId) {
      const error = new Error("Not authorized to update");
      error.statusCode = 403;
      throw error;
    }

    if (imageUrl !== post.imageUrl) {
      // if new image provided, delete old image url
      await clearImage(post.imageUrl);
    }
    post.title = title; // make the updates
    post.imageUrl = imageUrl;
    post.content = content;
    const result = await post.save(); // save in db

    // emit to inform all users about change
    io.getIO().emit("posts", { action: "update", post: result });
    res.status(200).json({ message: "Post updated!", post: result }); // send success message to front
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.deletePost = async (req, res, next) => {
  const postId = req.params.postId; // will be deleted based on this id if authorized

  // first find post and delete its image than delete prod from db
  try {
    const post = await Post.findById(postId);
    if (!post) {
      const error = new Error("could not find post");
      error.statusCode = 404;
      throw error;
    }
    // checking if the user is authorized to delete item, - if he created it
    if (post.creator.toString() !== req.userId) {
      const error = new Error("Not authorized to delete item");
      error.statusCode = 403;
      throw error;
    }

    clearImage(post.imageUrl); // deletes image from storage
    await Post.findByIdAndRemove(postId); // remove post from db

    // since users and posts are connected we need to pull them
    const user = await User.findById(req.userId);
    user.posts.pull(postId);
    await user.save();
    // again getting IO connection and emitting an event to delete in all places(users). pass the channel and action name, and id
    io.getIO().emit("posts", { action: "delete", post: postId });
    res.status(200).json({ message: "deleted post" }); // send corresponding message to front
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

// helper function to produce path to image and delete it
const clearImage = (filePath) => {
  filePath = path.join(__dirname, "..", filePath);
  fs.unlink(filePath, (err) => console.log(err));
};
