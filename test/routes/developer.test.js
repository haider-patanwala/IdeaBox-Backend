const request = require("supertest"); // for HTTP requests testing
const { expect } = require("chai");
const server = require("../../server");
// const Developer = require("../../models/developer");

let api;

describe("Developer API", () => {
  before("Initialize API in before block", (done) => {
    server
      .then((resultedApp) => {
        api = request(resultedApp);
      })
      .then(() => done())
      .catch(done);
  });

  it("GET all developers", (done) => {
    api
      .get("/developers")
      .then((response) => {
        expect(response.status).to.equal(200);
        done();
      })
      .catch(done);
  });
});
