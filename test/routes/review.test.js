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

  // test cases for POST route
  it("POST a review with invalid token", (done) => {
    api.post("/reviews")
      .set("authorization", "yJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiJvcmdfNjk1NzQ4NzQiLCJpYXQiOjE2ODk0Mzk5MjZ9.zxN1FqGIl1dODB2kxWVZoSmarqJOnVag0prUcgxtMOA")
      .then((response) => {
        expect(response.status).to.equal(401);

        expect(response.body).to.have.property("message", "Invalid authorization token.");
        expect(response.body).to.not.have.property("error");

        done();
      })
      .catch(done);
  });

  // test cases for POST route
  it("POST a review with no token", (done) => {
    api.post("/reviews")
      .then((response) => {
        expect(response.status).to.equal(400);

        expect(response.body).to.have.property("message", "Missing authorization token.");
        expect(response.body).to.not.have.property("error");

        done();
      })
      .catch(done);
  });

  // test cases for GET route
  it("GET all reviews", (done) => {
    api.get("/reviews?sort=createdAt,updatedAt")
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

  // test cases for PATCH route
  it("PATCH the proposal with wrong uid", (done) => {
    api.patch(`/reviews/${uid}xx`)
      .set("authorization", orgAuthToken)
      .then((response) => {
        expect(response.status).to.equal(422);

        expect(response.body).to.have.property("message", "Error updating review.");
        expect(response.body).to.have.property("error", "Error: Review not found.");

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

  // test cases for DELETE route
  it("DELETE the review with wrong uid", async () => {
    const deletePromise = api.delete(`/reviews/${uid}xx`)
      .set("authorization", devAuthToken)
      .then((response) => {
        expect(response.status).to.equal(422);

        expect(response.body).to.have.property("message", "Error deleting review.");
        expect(response.body).to.have.property("error", "Error: Review not found.");
      });
    await deletePromise;
    await reviewModal.deleteMany({});
  });
});
