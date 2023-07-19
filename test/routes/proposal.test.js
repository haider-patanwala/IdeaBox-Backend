const superTest = require("supertest");
const { expect } = require("chai");
const server = require("../../server");
const proposalModel = require("../../models/proposal");
require("dotenv").config();

const devAuthToken = process.env.DEV_AUTH_TOKEN;
const orgAuthToken = process.env.ORG_AUTH_TOKEN;
const devId = process.env.DEV_ID;
const projId = process.env.PROJ_ID;

let api;
let uid;

describe("Proposals API", () => {
  before("Initialize API in before block", (done) => {
    server.then((resultedApp) => {
      api = superTest(resultedApp);
      done();
    })
      .catch(done);
  });

  // NO NEED OF THIS BEFORE BLOCK as we can achieve the same thing by first doing a POST and then GET
  /*
  before("Create a proposal inn before block", (done) => {
    const dummyData = [{
      developer: devId,
      project: projId,
    }];
    // proposalModal.insertMany(dummyData)
    api.post("/proposals")
      .set("authorization", devAuthToken)
      .send(dummyData)
      .then(() => done())
      .catch(done);
  });
  */

  // test cases for POST route
  it("POST a proposal", (done) => {
    api.post("/proposals")
      .set("authorization", devAuthToken)
      .field("developer", devId)
      .field("project", projId)
      .then((response) => {
        uid = response.body.data.uid;

        expect(response.status).to.equal(201);

        expect(response.body).to.have.property("message", "Posted proposals successfully.");
        expect(response.body).to.have.property("data");
        expect(response.body).to.have.property("errors", null);

        done();
      })
      .catch(done);
  });
  // test cases for GET route
  it("GET all proposals", (done) => {
    console.log("org is ", orgAuthToken);
    api.get("/proposals")
      .set("authorization", orgAuthToken)
      .then((response) => {
        console.log("respone------", response.body);
        expect(response.status).to.equal(200);

        expect(response.body).to.have.property("message", "Fetched proposals successfully.");
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
    api.patch(`/proposals/${uid}`)
      .set("authorization", devAuthToken)
      .field("developer", devId)
      .field("project", projId)
      .then((response) => {
        expect(response.status).to.equal(200);

        expect(response.body).to.have.property("message");
        expect(response.body).to.have.property("message", "Updated proposal successfully.");
        expect(response.body).to.have.property("errors", null);

        done();
      })
      .catch(done);
  });

  // test cases for PATCH route
  it("PATCH the proposal with wrong uid", (done) => {
    api.patch(`/proposals/${uid}xx`)
      .set("authorization", devAuthToken)
      .field("developer", devId)
      .field("project", projId)
      .then((response) => {
        expect(response.status).to.equal(422);

        expect(response.body).to.have.property("message", "Error updating proposal.");
        expect(response.body).to.have.property("error", "Error: Proposal not found.");

        done();
      })
      .catch(done);
  });

  it("DELETE the proposal", async () => {
    const deletePromise = api.delete(`/proposals/${uid}`)
      .set("authorization", devAuthToken)
      .then((response) => {
        expect(response.status).to.equal(200);

        expect(response.body).to.have.property("message");
        expect(response.body).to.have.property("message", "Deleted proposal successfully.");
        expect(response.body).to.have.property("errors", null);
      });
    await deletePromise;

    // we dont mind deleting the dummy records of proposals as its not getting used anywhere else yet.
    await proposalModel.deleteMany({});
  });
  it("DELETE the proposal with wrong uid", async () => {
    const deletePromise = api.delete(`/proposals/${uid}xxx`)
      .set("authorization", devAuthToken)
      .then((response) => {
        expect(response.status).to.equal(422);

        expect(response.body).to.have.property("message", "Error deleting proposal.");
        expect(response.body).to.have.property("error", "Error: Proposal not found.");
      });
    await deletePromise;

    // we dont mind deleting the dummy records of proposals as its not getting used anywhere else yet.
    // await proposalModel.deleteMany({});
  });
});
