const superTest = require("supertest");
const { expect } = require("chai");
const server = require("../../server");
const reviewModal = require("../../models/review");
require("dotenv").config();

const devAuthToken = process.env.DEV_AUTH_TOKEN;
const orgAuthToken = process.env.ORG_AUTH_TOKEN;
const devId = process.env.DEV_ID;
const projId = process.env.PROJ_ID;

let api;
let uid;

describe('Reviews API', () => {
  before("Initialize API in before block", (done) => {
    server.then((resultedApp) => {
      api = superTest(resultedApp);
      done();
    })
      .catch(done);
  });
  // test cases for POST route
  it("POST a review", (done) => {
    api.post("/reviews")
      .set("authorization", devAuthToken)
      .field("review", "Testing with mocha, chai and supertest")
      .field("rating", 4)
      .field("developer", devId)
      .field("project", projId)
      .then((response) => {
        uid = response.body.data.uid;

        expect(response.status).to.equal(201);

        expect(response.body).to.have.property("message", "Review posted successfully");
        expect(response.body).to.have.property("data");
        expect(response.body).to.have.property("errors", null);

        done();
      })
      .catch(done);
  });
  // test cases for GET route
  it("GET all reviews", (done) => {
    api.get("/reviews")
      .then((response) => {
        expect(response.status).to.equal(200);

        expect(response.body).to.have.property("message", "Fetched reviews succesfully.");
        expect(response.body).to.has.property("data");
        expect(response.body).to.has.property("errors");
        expect(response.body.data).to.be.an("array");
        expect(response.body.errors).to.equal(null);

        done();
      })
      .catch(done);
  });

  // test cases for PATCH route
  it("PATCH the proposal", (done) => {
    api.patch(`/reviews/${uid}`)
      .set("authorization", orgAuthToken)
      .then((response) => {
        expect(response.status).to.equal(200);

        expect(response.body).to.have.property("message");
        expect(response.body).to.have.property("message", "Review updated");
        expect(response.body).to.have.property("errors", null);

        done();
      })
      .catch(done);
  });

  // test cases for DELETE route
  it("DELETE the review", async () => {
    const deletePromise = api.delete(`/reviews/${uid}`)
      .set("authorization", devAuthToken)
      .then((response) => {
        expect(response.status).to.equal(200);

        expect(response.body).to.have.property("message");
        expect(response.body).to.have.property("message", "Review deleted succesfully");
        expect(response.body).to.have.property("errors", null);
      });
    await deletePromise;
    await reviewModal.deleteMany({});
  });
});
