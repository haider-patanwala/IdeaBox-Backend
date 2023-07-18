const request = require("supertest"); // for HTTP requests testing
const { expect } = require("chai");
const server = require("../../server");
const organizationModel = require("../../models/organization"); // only for before and after hooks
require("dotenv").config();

const orgAuthToken = process.env.ORG_AUTH_TOKEN;

let api;
let uid;
let authToken;

describe("Organization API", () => {
  before("Initialize API in before block", (done) => {
    server
      .then((resultedApp) => {
        api = request(resultedApp);
        done();
      })
      // .then(() => done())
      .catch(done);
  });
  before("Create an organization in before block", (done) => {
    const dummyData = [{
      name: "Raw",
      about: "Providing cutting-edge IT solutions for businesses of all sizes.",
      website: "https://www.raweng.com/",
      domain: "IT & Engineering",
      password: "12345678",
    }];
    organizationModel.insertMany(dummyData)
      .then(() => done())
      .catch(done);
  });

  // test cases for GET routes
  it("GET all organizations", (done) => {
    api.get("/organizations")
      .then((response) => {
        expect(response.status).to.equal(200);

        expect(response.body).to.have.property("message", "Fetched organization successfully.");
        expect(response.body).to.has.property("data");
        expect(response.body).to.has.property("errors");
        expect(response.body.data).to.be.an("array");
        expect(response.body.errors).to.equal(null);

        done();
      })
      .catch(done);
  });

  // test cases for GET routes
  it("GET all organizations by searching name", (done) => {
    api.get("/organizations?name=squa")
      .then((response) => {
        expect(response.status).to.equal(200);

        expect(response.body.data[0]).to.has.property("name", "Square TechSolutions");

        done();
      })
      .catch(done);
  });

  // test cases for GET routes
  it("GET all organizations by searching domain and sorting", (done) => {
    api.get("/organizations?domain=solutions&sort=createdAt")
      .then((response) => {
        expect(response.status).to.equal(200);

        expect(response.body.data[0]).to.has.property("domain", "Technology Solutions");

        done();
      })
      .catch(done);
  });

  // test cases for POST route
  it("POST a organization", (done) => {
    api.post("/organizations/auth/register")
      .attach("photo", "test/resources/company.png")
      .field("name", "Raw Eng")
      .field("about", "Providing cutting-edge IT solutions for businesses of all sizes.")
      .field("website", "https://www.raweng.com/")
      .field("domain", "IT & Engineering")
      .field("password", "12345678")
      .then((response) => {
        authToken = response.body.data.access_token;
        uid = response.body.data.organization.uid;
        console.log("POST authToken is ----------", authToken);
        console.log("POST uid is ----------", uid);

        expect(response.status).to.equal(201);

        expect(response.body).to.have.property("message", "Organization created successfully.");
        expect(response.body).to.have.property("data");
        expect(response.body).to.have.property("errors", null);
        expect(response.body.data).to.have.property("access_token");
        expect(response.body.data).to.have.property("organization");

        done();
      })
      .catch((e) => done(e));
  });

  // test cases for POST route
  it("POST a organization without password", (done) => {
    api.post("/organizations/auth/register")
      .field("name", "Raw Eng")
      .then((response) => {
        expect(response.status).to.equal(400);

        expect(response.body).to.have.property("message", "Organization registration failed. Please provide a password.");
        expect(response.body).to.not.have.property("data");
        expect(response.body).to.have.property("error", "password : Password should be atleast 8 and maximum 16 characters");

        done();
      })
      .catch((e) => done(e));
  });

  // test cases for POST route
  it("POST a organization with invalid password", (done) => {
    api.post("/organizations/auth/register")
      .field("name", "Raw Eng")
      .field("password", "12345")
      .then((response) => {
        expect(response.status).to.equal(400);

        expect(response.body).to.have.property("message", "Organization registration failed. Please check your inputs.");
        expect(response.body).to.not.have.property("data");
        expect(response.body).to.have.property("error", "password : Password should be atleast 8 and maximum 16 characters");

        done();
      })
      .catch((e) => done(e));
  });

  // test cases for LOGIN route
  it("LOGIN a organization", (done) => {
    api.post("/organizations/auth/login")
      .field("uid", uid)
      .field("password", "12345678")
      .then((response) => {
        expect(response.status).to.equal(200);

        expect(response.body).to.have.property("message", "Organization logged in successfully.");
        expect(response.body).to.have.property("data");
        expect(response.body).to.have.property("errors", null);

        done();
      })
      .catch((e) => done(e));
  });

  // test cases for LOGIN route
  it("LOGIN a organization with wrong uid", (done) => {
    api.post("/organizations/auth/login")
      .field("uid", `${uid}xx`)
      .field("password", "12345678")
      .then((response) => {
        expect(response.status).to.equal(422);

        expect(response.body).to.have.property("message", "Error logging in Organization.");
        expect(response.body).to.not.have.property("data");
        expect(response.body).to.have.property("error", "Error: Organization not found.");

        done();
      })
      .catch((e) => done(e));
  });

  // test cases for LOGIN route
  it("LOGIN a organization with wrong password", (done) => {
    api.post("/organizations/auth/login")
      .field("uid", uid)
      .field("password", "123456789")
      .then((response) => {
        expect(response.status).to.equal(422);

        expect(response.body).to.have.property("message", "Error logging in Organization.");
        expect(response.body).to.not.have.property("data");
        expect(response.body).to.have.property("error", "Error: Incorrect Password.");

        done();
      })
      .catch((e) => done(e));
  });

  // test cases for GET routes
  it("GET specific organization", (done) => {
    api.get(`/organizations/${uid}`)
      .then((response) => {
        expect(response.status).to.equal(200);

        expect(response.body).to.have.property("message", "Fetched organization successfully");
        expect(response.body).to.has.property("data");
        expect(response.body).to.has.property("errors");
        expect(response.body.errors).to.equal(null);

        done();
      })
      .catch(done);
  });

  // test cases for GET routes
  it("GET specific organization with wrong uid", (done) => {
    api.get(`/organizations/${uid}xx`)
      .then((response) => {
        expect(response.status).to.equal(422);

        expect(response.body).to.have.property("message", "Error fetching organization.");
        expect(response.body).to.not.have.property("data");
        expect(response.body).to.has.property("error", "Error: Organization not found.");

        done();
      })
      .catch(done);
  });

  // test cases for PATCH route
  it("PATCH the organization", (done) => {
    api.patch(`/organizations/${uid}`)
      .set("authorization", authToken)
      .attach("photo", "test/resources/company.png")
      .field("domain", "IT")
      .then((response) => {
        console.log("PATCH token-----------", authToken);
        console.log("PATCH uid-----------", uid);
        console.log("UPDATED --------------", response.body);

        expect(response.status).to.equal(200);

        expect(response.body).to.have.property("message");
        expect(response.body).to.have.property("message", "Updated organization successfully.");
        expect(response.body).to.have.property("errors", null);
        done();
      })
      .catch((e) => done(e));
  });

  // test cases for PATCH route
  it("PATCH the organization with wrong uid", (done) => {
    api.patch(`/organizations/${uid}xx`)
      .set("authorization", authToken)
      .field("domain", "IT")
      .then((response) => {
        expect(response.status).to.equal(422);

        expect(response.body).to.have.property("message", "Error updating organization.");
        expect(response.body).to.have.property("error", "Error: Organization not found.");
        done();
      })
      .catch((e) => done(e));
  });

  // test cases for PATCH route
  it("PATCH the organization without authorization token", (done) => {
    api.patch(`/organizations/${uid}xx`)
      // .set("authorization", authToken)
      .field("domain", "IT")
      .then((response) => {
        expect(response.status).to.equal(400);

        expect(response.body).to.have.property("redirect", false);
        done();
      })
      .catch((e) => done(e));
  });

  // test cases for PATCH route
  it("PATCH the organization wihtout file", (done) => {
    api.patch(`/organizations/${uid}`)
      .set("authorization", authToken)
      .field("domain", "IT")
      .then((response) => {
        expect(response.status).to.equal(200);

        expect(response.body).to.have.property("message");
        expect(response.body).to.have.property("message", "Updated organization successfully.");
        expect(response.body).to.have.property("errors", null);
        done();
      })
      .catch((e) => done(e));
  });

  // test cases for DELETE route
  it("DELETE organization", async () => {
    const deletePromise = api.delete(`/organizations/${uid}`)
      .set("authorization", authToken)
      .then(async (response) => {
        console.log("DELETE token-----------", authToken);
        console.log("DELETE uid-----------", uid);
        console.log("DELETED Org-------------", response.body);

        expect(response.status).to.equal(200);

        expect(response.body).to.have.property("data");
        expect(response.body).to.have.property("message", "Deleted organization successfully.");
        expect(response.body).to.have.property("errors", null);
      });
    // remember to call the promise and delete method outside the promise definition over here
    await deletePromise;

    // await organizationModel.deleteMany({});
    // deleting just the recently added one which was inserted by our test suite.
    // We need atleast one organization in test db as the access_token of org is used in the project.test.js
    // if all documents are deleted then there would be nothing to verify the org's access_token upon in project.test.js
    await organizationModel.findOneAndDelete({}, { sort: { _id: -1 } })
      .then((result) => {
        console.log("Deleting the recently added document------->", result);
      })
      .catch((error) => {
        console.log("Error in deleting the recently added document------->", error);
      });
  });

  // test cases for DELETE route
  it("DELETE organization with wrong uid", async () => {
    const deletePromise = api.delete(`/organizations/${uid}xx`)
      .set("authorization", orgAuthToken)
      .then(async (response) => {
        expect(response.status).to.equal(400);

        expect(response.body).to.not.have.property("data");
        expect(response.body).to.have.property("message", "Error deleting organization.");
        expect(response.body).to.have.property("error", "Error: Organization not found");
      });
    // remember to call the promise and delete method outside the promise definition over here
    await deletePromise;
  });

  // test cases for DELETE route
  it("DELETE organization with expired authtoken", async () => {
    const deletePromise = api.delete(`/organizations/${uid}xx`)
      .set("authorization", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiJvcmdfNjk1NzQ4NzQiLCJpYXQiOjE2ODk0Mzk5MjZ9.zxN1FqGIl1dODB2kxWVZoSmarqJOnVag0prUcgxtMOA")
      .then(async (response) => {
        expect(response.status).to.equal(422);

        expect(response.body).to.not.have.property("data");
        expect(response.body).to.have.property("message", "Error in authentication operation.");
        expect(response.body).to.have.property("error", "Error: Session expired. Please login again.");
      });
    // remember to call the promise and delete method outside the promise definition over here
    await deletePromise;
  });
});
