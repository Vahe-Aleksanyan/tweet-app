// // testing code that requires authentication.
// // we are testing feedController.createPost, delete socket io part in controller to make the test work
//
// const expect = require("chai").expect;
// const sinon = require("sinon");
// const mongoose = require("mongoose");
//
// const User = require("../models/user");
// const FeedController = require("../controllers/feed");
//
// // testing asynchronous code
// describe("Feed-Controller", function () {
//   // runs before test cases.
//   before(function (done) {
//     // capable to run async code with done argument
//     // we don't need to connect in each test case. connect once and then do tests
//     mongoose
//       .connect(
//         "mongodb+srv://VVahe:vahe01@cluster0.kbjas.mongodb.net/test-messages"
//       )
//       .then(() => {
//         // set-up dummy user
//         const user = new User({
//           email: "tets@gmail.com",
//           password: "password",
//           name: "testik",
//           posts: [],
//           _id: "6282709cabafe2ac65be5521",
//         });
//         return user.save();
//       })
//       .then(() => {
//         done();
//       });
//   });
//
//   beforeEach(function () {});
//
//   afterEach(function () {});
//
//   it("should add a created post to the posts of the creator", function (done) {
//     const req = {
//       body: {
//         title: "just testing post",
//         content: "some content",
//       },
//       file: {
//         path: "abc",
//       },
//       userId: "6282709cabafe2ac65be5521",
//     };
//     const res = {
//       // duplication res object we use in feedController
//       status: function () {
//         return this;
//       },
//       json: function () {},
//     };
//     FeedController.createPost(req, res, () => {}).then((savedUser) => {
//       expect(savedUser).to.have.property("posts");
//       expect(savedUser.posts).to.have.length(1);
//       done();
//     });
//   });
//
//   // runs after test cases
//   after(function (done) {
//     // clean-up when we are done testing
//     User.deleteMany({}).then(() => {
//       mongoose.disconnect().then(() => {
//         done();
//       });
//     });
//   });
// });
//
