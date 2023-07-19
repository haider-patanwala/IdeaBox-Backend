const superTest = require("supertest");
const { expect } = require("chai");
const server = require("../../server");

let api;

describe("Server file", () => {
  before("Initialize API in before block", (done) => {
    server.then((resultedApp) => {
      api = superTest(resultedApp);
      done();
    })
      .catch(done);
  });

  it("Greetings call", (done) => {
    api.get("/")
      .then((response) => {
        // console.log("resp--------", response.text);
        expect(response.status).to.equal(200);
        expect(response.text).to.equal("Greetings from Project Listing App's Backend");
        done();
      })
      .catch(done);
  });
});
