const express = require("express");
const feedRoutes = require("./routes/feed");
const authRoutes = require("./routes/auth.js");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const path = require("path");
const multer = require("multer");

const { Server } = require("socket.io");
const http = require("http");
const app = express(); // execute express

const fileStorage = multer.diskStorage({
  // constant for uploading images
  destination: (req, file, cb) => {
    // where the images are being stored
    cb(null, "images"); // here null is for error
  },
  filename: (req, file, cb) => {
    // how label the image
    cb(null, new Date().toDateString() + "-" + file.originalname); // null is for error
  },
});

const fileFilter = (req, file, cb) => {
  // defiling which kind of images can be uploaded
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

app.use(bodyParser.json()); // parses incoming json data to make it possible to work with it

app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("image")
); // register multer with appropriate configuration

// to avoid CORS errors set this headers
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use("/feed", feedRoutes); // we forward any incoming routes which starts /feed to feedRoutes
app.use("/auth", authRoutes);

app.use("/images", express.static(path.join(__dirname, "images")));

// error handling middleware
app.use((err, req, res, next) => {
  console.log(err);
  const status = err.statusCode || 500;
  const message = err.message;
  const data = err.data;
  res.status(status).json({ message: message, data: data });
});

mongoose
  .connect("mongodb+srv://VVahe:vahe01@cluster0.kbjas.mongodb.net/messages")
  .then(() => {
    const server = app.listen(8080);
    const io = require("./socket").init(server);
    io.on("connection", (socket) => {
      console.log("Client connected");
    });
  })
  .catch((e) => {
    console.log(e);
  });
