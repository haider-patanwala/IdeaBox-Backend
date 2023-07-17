// We never have the need to import/require any MOCHA library since it runs in global instance and we run tests using mocha command.
// ---REMEMBER to enable mocha in .eslintrc.js file to avoid mocha related warnings

// chose BDD style with `expect` and not TDD's `assert`
const { expect } = require("chai");

const greetings = (flag = false) => {
  if (flag) {
    return {
      message: "Hello world",
      success: true,
    };
  }
  return {
    message: "Dumb world",
    success: false,
  };
};

// ---------MOCHA's `describe` interface
// To create a test we use `describe()` which describes a "suite"(a group of related test cases) with the given `title` and `callback fn` containing nested suites.
// The `describe` function accepts a string as a description of the tests and a function to define your test cases.
describe("Sample Testing", () => {
  // it() is to write a test case
  it("Should return success", () => {
    const result = greetings(true);

    // ---- expect() is a BDD style assertion
    expect(result).to.be.an("object");
    expect(result).to.have.property("message");
    expect(result).to.have.property("success");

    expect(result.message).to.equal("Hello world");
    expect(result.success).to.equal(true);
  });
  it("Should return success=false", () => {
    const result = greetings(false);

    expect(result).to.be.an("object");
    expect(result).to.have.property("message");
    expect(result).to.have.property("success");

    expect(result.message).to.equal("Dumb world");
    expect(result.success).to.equal(false);
  });
});
