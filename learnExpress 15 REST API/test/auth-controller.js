const expect = require("chai").expect;
const sinon = require("sinon");
const mongoose = require("mongoose");

const User = require("../models/user");
const AuthController = require("../controllers/auth");

// testing asynchronous code
describe("AUth-Controller: Login", function () {
  // runs before test cases.
  before(function (done) {
    // capable to run async code with done argument
    // we don't need to connect in each test case. connect once and then do tests
    mongoose
      .connect(
        "mongodb+srv://VVahe:vahe01@cluster0.kbjas.mongodb.net/test-messages"
      )
      .then(() => {
        const user = new User({
          email: "tets@gmail.com",
          password: "psas",
          name: "testik",
          posts: [],
          _id: "6282709cabafe2ac65be5521",
        });
        return user.save();
      })
      .then(() => {
        done();
      });
  });
  it("should throw an error with code 500 if accessing database fails", function (done) {
    sinon.stub(User, "findOne"); // duplicating the method
    User.findOne.throws(); // making it to throw an error to test error case

    const req = {
      body: {
        email: "test@gmail.com",
        password: "testooooo",
      },
    };
    // checking error status code after getting result
    AuthController.login(req, {}, () => {}).then((result) => {
      expect(result).to.be.an("error");
      expect(result).to.have.property("statusCode", 500);
      done(); // we say mocha to wait for this code to execute
    });
    User.findOne.restore();
  });

  it("should send a  response with a valid user status for existing user ", function (done) {
    const req = {
      userId: "6282709cabafe2ac65be5521",
    };
    const res = {
      statusCode: 500,
      userStatus: null,
      status: function (code) {
        this.statusCode = code;
        return this;
      },
      json: function (data) {
        this.userStatus = data.status; // data is object
      },
    };
    AuthController.getUserStatus(req, res, () => {}).then(() => {
      expect(res.statusCode).to.be.equal(200);
      expect(res.userStatus).to.be.equal("I am knew");
      done();
    });
  });
  // runs after test cases
  after(function (done) {
    // clean-up when we are done testing
    User.deleteMany({}).then(() => {
      mongoose.disconnect().then(() => {
        done();
      });
    });
  });
});
