// this test succeeds if we have
//   a) error
//   b) we throw error with different message
const authMiddleware = require("../middleware/is-auth");
//const { decode } = require("jsonwebtoken");
const expect = require("chai").expect;
const jwt = require("jsonwebtoken");
const sinon = require("sinon");

describe("Auth middleware", function () {
  // encapsulating in one entity
  // we test the behaviour when it returns null
  it("it should throw error if no authorization header is present", function () {
    const req = {
      get: function (headername) {
        return null;
      },
    };
    // {} for res and () => {} for next()
    expect(authMiddleware.bind(this, req, {}, () => {})).to.throw(
      "Not Authorization"
    );
  });

  it("should throw error if authorization header is only one string", function () {
    const req = {
      get: function (headername) {
        return "xyz"; // just returns one string
      },
    };
    expect(authMiddleware.bind(this, {}, () => {})).to.throw(); // in case for any error
  });

  // we test if our code behaves correctly depending on what verify() does
  it("should throw error if the token cannot be verified", function () {
    const req = {
      get: function (headername) {
        return "Bearer xyz"; // just returns not correct token
      },
    };
    expect(authMiddleware.bind(this, {}, () => {})).to.throw();
  });

  it("should yield userId after decoding the token", function () {
    const req = {
      get: function (headername) {
        return "Bearer xysafafarwfz"; // assume returns right decoded token
      },
    };

    // we pass object which has the method we want to replace, and as a string thr method name
    sinon.stub(jwt, "verify"); // now the sinon will replace the function
    // now this is a stub. returns added by stub
    jwt.verify.returns({
      userId: "abc",
    });

    authMiddleware(req, {}, () => {});
    expect(req).to.have.property("userId");
    expect(jwt.verify.called).to.be.true;
    jwt.verify.restore(); // this restores original function
  });
});
